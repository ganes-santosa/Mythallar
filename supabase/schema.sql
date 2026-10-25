-- ==============================================================================
-- Mythallar Supabase Cloud Sync Schema
-- Run this in your Supabase Project's SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Create Characters Table
create table if not exists public.characters (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  class_name text not null,
  level integer not null default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

-- 2. Create Homebrew Spells Table
create table if not exists public.homebrew_spells (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

-- 3. Enable Row Level Security (RLS)
alter table public.characters enable row level security;
alter table public.homebrew_spells enable row level security;

-- 4. RLS Policies for Characters (Users can only view, create, edit, delete their own records)
drop policy if exists "Users can read own characters" on public.characters;
create policy "Users can read own characters"
  on public.characters for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own characters" on public.characters;
create policy "Users can insert own characters"
  on public.characters for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own characters" on public.characters;
create policy "Users can update own characters"
  on public.characters for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own characters" on public.characters;
create policy "Users can delete own characters"
  on public.characters for delete
  using (auth.uid() = user_id);

-- 5. RLS Policies for Homebrew Spells
drop policy if exists "Users can manage own homebrew spells" on public.homebrew_spells;
create policy "Users can manage own homebrew spells"
  on public.homebrew_spells for all
  using (auth.uid() = user_id);
