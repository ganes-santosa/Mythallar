# Supabase Cloud Sync with Google Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Authentication and cloud synchronization for characters and homebrew spells backed by Supabase while preserving full offline capability via `localStorage`.

**Architecture:** Client-side React SPA connects to hosted Supabase via `@supabase/supabase-js`. `src/utils/supabase.js` provides auth wrappers and client singleton. `src/utils/syncService.js` coordinates pull-on-login, debounced push-on-edit, and local-cloud merges. `src/components/Header/AuthStatus.jsx` renders cloud status and Google login button.

**Tech Stack:** React 18, Vite, `@supabase/supabase-js`, Lucide React, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-25-supabase-google-sync-design.md`

## Global Constraints
- **Platform**: Client-side Single Page Application with offline-first persistence.
- **Dependencies**: Add only `@supabase/supabase-js`.
- **Environment variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Must fall back safely when missing or offline.
- **Storage namespace**: Existing `localStorage` keys `dnd_spellbook_data` and `dnd_homebrew_spells` remain the local source of truth.

## Review Focus
1. **Missing Supabase Config**: App continues running in offline-only mode with zero console crash if environment variables are not set.
2. **Initial Login Local Merge**: Existing guest characters in `localStorage` merge upward to the cloud user account instead of being wiped out on first login.
3. **Network Offline Recovery**: If a sync request fails due to no internet, mark status as offline and retry on next change or manual trigger without crashing.
4. **Log Out State Isolation**: Logging out switches back to guest mode without clearing current offline session data unless explicit.
5. **Debounced Writes**: Typing character notes or changing spell slots rapidly does not spam database requests.

---

### Task 1: Install `@supabase/supabase-js` & Client Singleton

**Files:**
- Modify: `package.json`
- Create: `src/utils/supabase.js`
- Test: `src/utils/supabase.test.js`

**Interfaces:**
- Produces: `getSupabase() -> SupabaseClient | null`
- Produces: `isSupabaseConfigured() -> boolean`
- Produces: `signInWithGoogle() -> Promise<{ data, error }>`
- Produces: `signOut() -> Promise<{ error }>`

- [ ] **Step 1: Install `@supabase/supabase-js`**
  Run: `npm install @supabase/supabase-js`

- [ ] **Step 2: Write tests for `supabase.js`**
  Test initialization when env vars exist vs missing, and verify helper methods handle null client gracefully.

- [ ] **Step 3: Implement `src/utils/supabase.js`**
  Read `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`. If present, instantiate `createClient`.

- [ ] **Step 4: Run tests and verify**
  Run `npx vitest run src/utils/supabase.test.js`

- [ ] **Step 5: Commit**
  ```bash
  git add package.json package-lock.json src/utils/supabase*
  git commit -m "feat: add supabase client singleton and auth helpers"
  ```

---

### Task 2: Cloud Sync Service (Characters & Homebrew Spells)

**Files:**
- Create: `src/utils/syncService.js`
- Test: `src/utils/syncService.test.js`

**Interfaces:**
- Produces: `fetchCloudData(client, userId: string) -> Promise<{ characters: Array, homebrewSpells: Array }>`
- Produces: `syncCharactersToCloud(client, userId: string, characters: Array) -> Promise<{ success: boolean, error: any }>`
- Produces: `syncHomebrewToCloud(client, userId: string, spells: Array) -> Promise<{ success: boolean, error: any }>`
- Produces: `mergeLocalAndCloud(localChars: Array, cloudChars: Array) -> Array`

- [ ] **Step 1: Write tests for `syncService.js`**
  Test merging arrays by ID, upsert payloads, and error handling when database errors occur.

- [ ] **Step 2: Implement `src/utils/syncService.js`**
  Implement PostgreSQL queries against `characters` and `homebrew_spells` tables. Implement merge logic where cloud entries not present locally are appended.

- [ ] **Step 3: Run tests and verify**
  Run `npx vitest run src/utils/syncService.test.js`

- [ ] **Step 4: Commit**
  ```bash
  git add src/utils/syncService*
  git commit -m "feat: add cloud sync service for characters and homebrew spells"
  ```

---

### Task 3: Auth Status UI & Header Component

**Files:**
- Create: `src/components/Header/AuthStatus.jsx`
- Test: `src/components/Header/AuthStatus.test.jsx`
- Modify: `src/components/Header/CharacterHeader.jsx`

**Interfaces:**
- Consumes: `user`, `syncStatus ('idle'|'syncing'|'saved'|'error'|'offline')`, `onSignIn`, `onSignOut`, `onSyncNow`
- Produces: Visual cloud status badge with Google sign-in trigger and user profile dropdown.

- [ ] **Step 1: Write test for `AuthStatus.jsx`**
  Test logged-out state ("Sign in with Google" button), logged-in state (user email, cloud status icon, sign-out button).

- [ ] **Step 2: Implement `AuthStatus.jsx`**
  Build compact dropdown with Google G logo, user display email, sync indicator (CloudCheck, CloudUpload, CloudOff), and Sign Out option.

- [ ] **Step 3: Mount `AuthStatus` in `CharacterHeader.jsx`**
  Add `AuthStatus` to right header toolset next to Export/Import buttons.

- [ ] **Step 4: Run tests and verify**
  Run `npx vitest run src/components/Header/AuthStatus.test.jsx`

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/Header/AuthStatus* src/components/Header/CharacterHeader.jsx
  git commit -m "feat: add auth status component and mount in header"
  ```

---

### Task 4: Full App State Wiring & SQL Schema Documentation

**Files:**
- Modify: `src/App.jsx`
- Create: `supabase/schema.sql`
- Create: `.env.example`
- Test: `src/App.test.jsx`

**Interfaces:**
- Listens to `supabase.auth.onAuthStateChange`
- Triggers cloud fetch on login, debounced push on character changes
- Generates toast notifications on sync success/failure

- [ ] **Step 1: Create `supabase/schema.sql` and `.env.example`**
  Write copy-pasteable SQL setup script containing table creation and RLS policies from design doc.

- [ ] **Step 2: Wire auth and sync events in `src/App.jsx`**
  Track `user` and `syncStatus` state in `App.jsx`. Connect `syncService` on user login and debounced profile edits.

- [ ] **Step 3: Update and run all unit & integration tests**
  Run `npm test` and verify all tests pass.

- [ ] **Step 4: Commit**
  ```bash
  git add src/App* supabase/ .env.example
  git commit -m "feat: wire cloud sync into app state and provide supabase schema"
  ```
