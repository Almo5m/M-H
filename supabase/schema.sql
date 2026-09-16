-- ============================================================
-- Schema v2 — Supabase Auth + spaces + Row Level Security
--
-- This REPLACES schema.sql entirely. It assumes a fresh/near-empty
-- project; run it in the SQL editor after enabling Supabase Auth.
-- If schema.sql was already run, run the "drop old tables" block
-- first (or just reset the project) before running the rest.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- drop the old (v1) shared-password-era tables ----------
drop table if exists question_exchange cascade;
drop table if exists archive_entries cascade;
drop table if exists locked_messages cascade;
drop table if exists memory_photos cascade;
drop table if exists playlist_songs cascade;
drop table if exists shared_dreams cascade;
drop table if exists presence cascade;
drop table if exists visit_log cascade;
drop type if exists partner cascade;

-- ============================================================
-- Identity: profiles, spaces, space_members
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  message_to_partner text not null default 'بحبك',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are readable by any authenticated user"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "a user can update their own profile"
  on profiles for update
  using (id = auth.uid());

-- A new auth user automatically gets a profile row.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create table spaces (
  id uuid primary key default gen_random_uuid(),
  relationship_start_date date,
  created_at timestamptz not null default now()
);

alter table spaces enable row level security;

create table space_members (
  space_id uuid not null references spaces(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

alter table space_members enable row level security;

-- Helper used by every RLS policy below: is the current user a member
-- of this space? security definer so it can read space_members even
-- though space_members' own RLS would otherwise block the lookup.
create or replace function is_space_member(check_space_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from space_members
    where space_id = check_space_id and user_id = auth.uid()
  );
$$;

create policy "space members can see their space"
  on spaces for select
  using (is_space_member(id));

create policy "space members can update their space"
  on spaces for update
  using (is_space_member(id));

create policy "space members can see their membership rows"
  on space_members for select
  using (is_space_member(space_id));

-- ============================================================
-- Content tables
-- Every table: id, space_id, created_by (auto = auth.uid()), created_at.
-- RLS: only members of the row's space may see/write it, and a row's
-- created_by must match the inserting user — never a client-supplied value.
-- ============================================================

-- ---------- شخصية/presence: who's here, and first-story flag ----------
create table presence (
  user_id uuid primary key references profiles(id) on delete cascade,
  space_id uuid not null references spaces(id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

alter table presence enable row level security;

create policy "space members can read presence" on presence
  for select using (is_space_member(space_id));
create policy "a user can upsert their own presence" on presence
  for insert with check (is_space_member(space_id) and user_id = auth.uid());
create policy "a user can update their own presence" on presence
  for update using (user_id = auth.uid());

-- ---------- لحظات لينا / احنا (memory photos) ----------
create table memory_photos (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  created_by uuid not null references profiles(id) default auth.uid(),
  storage_path text not null,
  caption text,
  taken_at date,
  created_at timestamptz not null default now()
);

alter table memory_photos enable row level security;

create policy "space members can read photos" on memory_photos
  for select using (is_space_member(space_id));
create policy "space members can add photos" on memory_photos
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can delete photos" on memory_photos
  for delete using (is_space_member(space_id));

-- ---------- نسمع (playlist) ----------
create table playlist_songs (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  created_by uuid not null references profiles(id) default auth.uid(),
  title text not null,
  artist text,
  storage_path text not null,
  cover_storage_path text,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table playlist_songs enable row level security;

create policy "space members can read songs" on playlist_songs
  for select using (is_space_member(space_id));
create policy "space members can add songs" on playlist_songs
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can update songs" on playlist_songs
  for update using (is_space_member(space_id));
create policy "space members can delete songs" on playlist_songs
  for delete using (is_space_member(space_id));

-- ---------- أحلامنا (dreams) ----------
create table shared_dreams (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  created_by uuid not null references profiles(id) default auth.uid(),
  title text not null,
  description text,
  category text,
  target_date date,
  status text not null default 'نفسي فيه' check (status in ('نفسي فيه', 'بنخططله', 'قرب', 'اتحقق')),
  achieved_at date,
  photo_storage_path text,
  created_at timestamptz not null default now()
);

alter table shared_dreams enable row level security;

create policy "space members can read dreams" on shared_dreams
  for select using (is_space_member(space_id));
create policy "space members can add dreams" on shared_dreams
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can update dreams" on shared_dreams
  for update using (is_space_member(space_id));
create policy "space members can delete dreams" on shared_dreams
  for delete using (is_space_member(space_id));

-- ---------- يومنا (shared habits) ----------
create table habits (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  created_by uuid not null references profiles(id) default auth.uid(),
  assigned_to uuid references profiles(id), -- null = shared ("إحنا الاتنين")
  title text not null,
  recurrence_type text not null check (recurrence_type in ('daily', 'weekly_days', 'once')),
  recurrence_days int[], -- 0=Sunday..6=Saturday, used only for weekly_days
  once_date date,        -- used only for once
  created_at timestamptz not null default now()
);

alter table habits enable row level security;

create policy "space members can read habits" on habits
  for select using (is_space_member(space_id));
create policy "space members can add habits" on habits
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can update habits" on habits
  for update using (is_space_member(space_id));
create policy "space members can delete habits" on habits
  for delete using (is_space_member(space_id));

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  space_id uuid not null references spaces(id) on delete cascade,
  user_id uuid not null references profiles(id) default auth.uid(),
  log_date date not null,
  status text not null check (status in ('اتعملت', 'اتأجلت')),
  reason text,
  created_at timestamptz not null default now(),
  unique (habit_id, user_id, log_date)
);

alter table habit_logs enable row level security;

create policy "space members can read habit logs" on habit_logs
  for select using (is_space_member(space_id));
create policy "a user can log their own habit status" on habit_logs
  for insert with check (is_space_member(space_id) and user_id = auth.uid());
create policy "a user can update their own habit log" on habit_logs
  for update using (user_id = auth.uid());
create policy "a user can clear their own habit log" on habit_logs
  for delete using (user_id = auth.uid());

-- ---------- نفتكر (important dates) ----------
create table remembered_dates (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  created_by uuid not null references profiles(id) default auth.uid(),
  title text not null,
  event_date date not null,
  recurs_yearly boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);

alter table remembered_dates enable row level security;

create policy "space members can read dates" on remembered_dates
  for select using (is_space_member(space_id));
create policy "space members can add dates" on remembered_dates
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can update dates" on remembered_dates
  for update using (is_space_member(space_id));
create policy "space members can delete dates" on remembered_dates
  for delete using (is_space_member(space_id));

-- ---------- بصراحة (honest talk) ----------
create table honesty_notes (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  created_by uuid not null references profiles(id) default auth.uid(),
  recipient_id uuid not null references profiles(id),
  content text not null,
  mood_tag text,
  read_at timestamptz,
  reply_type text check (reply_type in ('فهمتك', 'خلينا نتكلم', 'محتاج أفكر')),
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

alter table honesty_notes enable row level security;

create policy "space members can read honesty notes" on honesty_notes
  for select using (is_space_member(space_id));
create policy "space members can write their own honesty notes" on honesty_notes
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can update honesty notes" on honesty_notes
  for update using (is_space_member(space_id));

-- ---------- مفاجأة (surprises) ----------
create table surprises (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  created_by uuid not null references profiles(id) default auth.uid(),
  recipient_id uuid not null references profiles(id),
  content_type text not null check (content_type in ('text', 'photo')),
  text_content text,
  photo_storage_path text,
  reveal_at timestamptz not null,
  revealed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table surprises enable row level security;

create policy "space members can read surprises" on surprises
  for select using (is_space_member(space_id));
create policy "space members can create surprises" on surprises
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can update surprises" on surprises
  for update using (is_space_member(space_id));
create policy "creators can delete their unrevealed surprises" on surprises
  for delete using (is_space_member(space_id) and created_by = auth.uid() and revealed_at is null);

-- ---------- نلعب: shared real-time match state for all games ----------
create table game_matches (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  game_key text not null,
  state jsonb not null,
  status text not null default 'active' check (status in ('active', 'finished')),
  turn_user_id uuid references profiles(id),
  winner_user_id uuid references profiles(id),
  created_by uuid not null references profiles(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table game_matches enable row level security;

create policy "space members can read matches" on game_matches
  for select using (is_space_member(space_id));
create policy "space members can create matches" on game_matches
  for insert with check (is_space_member(space_id) and created_by = auth.uid());
create policy "space members can update matches" on game_matches
  for update using (is_space_member(space_id));

alter publication supabase_realtime add table game_matches;

-- Basra needs hidden information (each player's hand, and the undealt
-- deck) that the other player must NOT be able to read — game_matches
-- itself is readable by both space members, so it only ever holds
-- PUBLIC game state (the table, captured piles, counts). Private state
-- lives here instead:

create table game_hands (
  match_id uuid not null references game_matches(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  cards jsonb not null default '[]'::jsonb,
  primary key (match_id, user_id)
);

alter table game_hands enable row level security;

create policy "a player can read only their own hand" on game_hands
  for select using (user_id = auth.uid());

-- No insert/update/delete policy on purpose — only the server (service
-- role, which bypasses RLS) is ever allowed to deal or remove cards.

alter publication supabase_realtime add table game_hands;

create table game_decks (
  match_id uuid primary key references game_matches(id) on delete cascade,
  cards jsonb not null default '[]'::jsonb
);

alter table game_decks enable row level security;

-- Intentionally zero policies — nobody (not even space members) can
-- read or write this table directly; only the service-role server code
-- that deals cards ever touches it.

-- ============================================================
-- Storage buckets — public read (access is already gated by
-- Supabase Auth + the shared passphrase at the application layer),
-- but writes go through RLS-checked storage policies below.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true) on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('songs', 'songs', true) on conflict (id) do nothing;

create policy "authenticated users can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "authenticated users can upload songs"
  on storage.objects for insert
  with check (bucket_id = 'songs' and auth.role() = 'authenticated');

create policy "anyone can read photos/songs (buckets are public)"
  on storage.objects for select
  using (bucket_id in ('photos', 'songs'));
