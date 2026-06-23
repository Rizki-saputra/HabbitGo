-- =============================================
--  HABITGO — Supabase Schema (Complete)
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
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  owner_id      uuid not null references auth.users(id) on delete cascade,
  invite_code   text unique not null default upper(substring(replace(gen_random_uuid()::text,'-','') from 1 for 6)),
  member_count  int not null default 1,
  created_at    timestamptz default now()
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

-- ---- Group Shared Habits ----
-- Habits yang di-share oleh member ke dalam grup
create table public.group_habits (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  habit_id    uuid not null references public.habits(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  shared_at   timestamptz default now(),
  unique(group_id, habit_id)
);

-- ---- Activity Feed ----
-- Log aktivitas di dalam grup (check-in, join, dll)
create table public.group_activities (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('checkin','joined','streak_milestone')),
  habit_name  text,
  meta        jsonb,
  created_at  timestamptz default now()
);

-- =============================================
--  ROW LEVEL SECURITY
-- =============================================

alter table public.profiles       enable row level security;
alter table public.habits         enable row level security;
alter table public.habit_logs     enable row level security;
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.group_habits   enable row level security;
alter table public.group_activities enable row level security;

-- Profiles
create policy "read own profile"    on public.profiles for select using (auth.uid() = id);
create policy "update own profile"  on public.profiles for update using (auth.uid() = id);

-- Allow group members to read each other's profiles (for leaderboard/feed)
create policy "members read profiles" on public.profiles for select using (
  exists (
    select 1 from public.group_members gm1
    join public.group_members gm2 on gm1.group_id = gm2.group_id
    where gm1.user_id = auth.uid() and gm2.user_id = id
  )
);

-- Habits
create policy "manage own habits"   on public.habits for all using (auth.uid() = user_id);

-- Habit Logs
create policy "manage own logs"     on public.habit_logs for all using (auth.uid() = user_id);

-- Allow group members to read each other's logs (for leaderboard)
create policy "members read logs"   on public.habit_logs for select using (
  exists (
    select 1 from public.group_habits gh
    join public.group_members gm on gh.group_id = gm.group_id
    where gh.habit_id = habit_id and gm.user_id = auth.uid()
  )
);

-- Groups
create policy "members read group"  on public.groups for select using (
  auth.uid() = owner_id or
  exists (select 1 from public.group_members where group_id = id and user_id = auth.uid())
);
create policy "anyone find by code" on public.groups for select using (true); -- needed for invite lookup
create policy "owners manage group" on public.groups for all using (auth.uid() = owner_id);
create policy "anyone insert group" on public.groups for insert with check (auth.uid() = owner_id);

-- Group Members
create policy "members read memberships" on public.group_members for select using (
  exists (select 1 from public.group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
);
create policy "self join group"     on public.group_members for insert with check (user_id = auth.uid());
create policy "self or owner leave" on public.group_members for delete using (
  user_id = auth.uid() or
  exists (select 1 from public.groups where id = group_id and owner_id = auth.uid())
);

-- Group Habits
create policy "members read group habits" on public.group_habits for select using (
  exists (select 1 from public.group_members where group_id = group_id and user_id = auth.uid())
);
create policy "members share habits" on public.group_habits for insert with check (
  user_id = auth.uid() and
  exists (select 1 from public.group_members where group_id = group_id and user_id = auth.uid())
);
create policy "owner unshare habits" on public.group_habits for delete using (
  user_id = auth.uid()
);

-- Activity Feed
create policy "members read feed"   on public.group_activities for select using (
  exists (select 1 from public.group_members where group_id = group_id and user_id = auth.uid())
);
create policy "members write feed"  on public.group_activities for insert with check (
  user_id = auth.uid() and
  exists (select 1 from public.group_members where group_id = group_id and user_id = auth.uid())
);

-- =============================================
--  FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on signup
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

-- Auto update member_count on group_members change
create or replace function public.update_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.groups set member_count = member_count + 1 where id = NEW.group_id;
  elsif TG_OP = 'DELETE' then
    update public.groups set member_count = member_count - 1 where id = OLD.group_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_member_change
  after insert or delete on public.group_members
  for each row execute function public.update_member_count();

-- =============================================
--  STORAGE BUCKET FOR AVATARS
-- =============================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "anyone view avatars"   on storage.objects for select using (bucket_id = 'avatars');
create policy "users upload avatar"   on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
create policy "users update avatar"   on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
