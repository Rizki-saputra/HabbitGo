-- =============================================
--  HABITGO — Supabase Schema
--  Run this in: SQL Editor → New Query
-- =============================================

-- ---- Profiles ----
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ---- Habits ----
create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  icon        text not null default 'bi-check2-circle',
  category    text not null default 'other',
  frequency   text not null default 'daily' check (frequency in ('daily','weekly')),
  days        int[],
  created_at  timestamptz default now()
);

-- ---- Habit Logs ----
create table public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  habit_id    uuid not null references public.habits(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null,
  created_at  timestamptz default now(),
  unique(habit_id, log_date)
);

-- ---- Groups ----
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now()
);

-- ---- Group Members ----
create table public.group_members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'member' check (role in ('owner','member')),
  joined_at   timestamptz default now(),
  unique(group_id, user_id)
);

-- =============================================
--  ROW LEVEL SECURITY
-- =============================================

alter table public.profiles     enable row level security;
alter table public.habits       enable row level security;
alter table public.habit_logs   enable row level security;
alter table public.groups       enable row level security;
alter table public.group_members enable row level security;

-- Profiles
create policy "users read own profile"   on public.profiles for select  using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update  using (auth.uid() = id);

-- Habits
create policy "users manage own habits"  on public.habits   for all     using (auth.uid() = user_id);

-- Habit Logs
create policy "users manage own logs"    on public.habit_logs for all   using (auth.uid() = user_id);

-- Groups: members can read, owners can manage
create policy "members read group"       on public.groups for select using (
  auth.uid() = owner_id or
  exists (select 1 from public.group_members where group_id = id and user_id = auth.uid())
);
create policy "owners manage group"      on public.groups for all using (auth.uid() = owner_id);
create policy "users read memberships"   on public.group_members for select using (
  user_id = auth.uid()
);
create policy "insert membership"        on public.group_members for insert with check (
  user_id = auth.uid()
);
create policy "owners delete members"    on public.group_members for delete using (
  exists (select 1 from public.groups where id = group_id and owner_id = auth.uid())
  or user_id = auth.uid()
);

-- =============================================
--  AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
--  STORAGE BUCKET FOR AVATARS
--  Run in SQL Editor OR set up via Dashboard:
--  Storage → New bucket → "avatars" → Public
-- =============================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));

create policy "users update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
