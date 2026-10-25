# Design Document: Supabase Cloud Sync with Google Authentication

**Date:** 2026-10-25  
**Status:** Approved by User  
**Target:** Mythallar D&D 5e Spellbook

---

## 1. Intent & Overview
Enable players to access their characters, spell slots, prepared spells, and custom homebrew spells across any device (phone, laptop, tablet) via seamless single-click Google Authentication backed by a hosted Supabase project.

---

## 2. Goals & Non-Goals

### Goals
- **Single-Click Auth**: Sign in with Google via Supabase OAuth (`supabase.auth.signInWithOAuth({ provider: 'google' })`).
- **Offline First**: App operates immediately with local cache (`localStorage`), transparently syncing to Supabase when authenticated.
- **Bi-directional Sync**:
  - Pull latest character profiles and homebrew spells on login / app launch.
  - Push character updates (debounced) and homebrew spells to Supabase.
- **Merge on Initial Sign-in**: If a guest player has local characters before logging in, safely merge them with their cloud account without data loss.
- **Clean Sync UI**:
  - Header shows Auth status: "Sign in with Google" button when logged out; User avatar/email + Sync Status badge (Saved / Syncing / Offline) + Sign Out dropdown when logged in.
  - Manual "Sync Now" button in settings/menu.

### Non-Goals
- Real-time multiplayer co-editing of the exact same character concurrently by multiple players.
- Complex operational conflict resolution (Last-Write-Wins via `updated_at` timestamp timestamp is sufficient).

---

## 3. Approaches Considered

1. **Option A: Central Supabase + Google OAuth (Selected)**
   - *Pros:* Best user experience. Single click on mobile/desktop. Zero API key copy-pasting. Secure RLS policies per `auth.uid()`.
   - *Cons:* Requires one-time Google Cloud OAuth Client ID configuration in Supabase Dashboard.
2. **Option B: Bring Your Own Supabase (URL + Anon Key)**
   - *Pros:* No central database to manage.
   - *Cons:* Tedious manual copy-pasting on every mobile device.
3. **Option C: Hybrid (Central + Custom Override)**
   - Extra complexity without immediate user demand.

---

## 4. Architecture & Schema

### Database Schema (Supabase PostgreSQL with Row Level Security)

#### Table 1: `characters`
```sql
create table public.characters (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  class_name text not null,
  level integer not null default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

alter table public.characters enable row level security;

create policy "Users can read own characters"
  on public.characters for select
  using (auth.uid() = user_id);

create policy "Users can insert own characters"
  on public.characters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own characters"
  on public.characters for update
  using (auth.uid() = user_id);

create policy "Users can delete own characters"
  on public.characters for delete
  using (auth.uid() = user_id);
```

#### Table 2: `homebrew_spells`
```sql
create table public.homebrew_spells (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

alter table public.homebrew_spells enable row level security;

create policy "Users can manage own homebrew spells"
  on public.homebrew_spells for all
  using (auth.uid() = user_id);
```

---

## 5. Implementation Structure

1. **Environment Config**:
   - `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Safe fallback when variables are missing (graceful offline-only mode with UI hint).
2. **Supabase Client (`src/utils/supabase.js`)**:
   - Initializes client conditionally.
   - Exposes `signInWithGoogle`, `signOut`, `getCurrentUser`, `onAuthStateChange`.
3. **Cloud Sync Service (`src/utils/syncService.js`)**:
   - `fetchCloudData(userId)` -> pulls characters & homebrew spells.
   - `saveCloudCharacter(userId, character)` -> upserts character record.
   - `deleteCloudCharacter(userId, characterId)` -> deletes character record.
   - `saveCloudHomebrewSpell(userId, spell)` -> upserts spell.
   - `deleteCloudHomebrewSpell(userId, spellId)` -> removes spell.
4. **Header Integration (`src/components/Header/AuthStatus.jsx`)**:
   - Visual status icon: Cloud checkmark (in sync), Cloud spin (syncing), Cloud slash (offline/disconnected).
   - "Sign In" button opening dropdown or Google auth directly.
   - Account avatar with User display name/email and Log Out button.
5. **App Wiring (`src/App.jsx`)**:
   - Auto-sync debounced character updates when authenticated.
   - Toast notifications for sync events.

---

## 6. Verification Plan
- Unit tests for `syncService.js` (mocking Supabase client).
- Unit tests for `AuthStatus.jsx` (logged in vs logged out vs offline).
- Integration check in browser dev server verifying unauthenticated fallback and OAuth trigger.
