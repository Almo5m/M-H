-- Our World — Supabase schema
-- All access to these tables happens through server-side route handlers
-- using the service role key. Row Level Security is enabled and left
-- fully closed (no policies) since the Next.js server is the only client
-- that ever talks to Postgres directly — the anon key is not used.

create extension if not exists "pgcrypto";

create type partner as enum ('moaz', 'hanona');

-- ==========================================================
-- Question exchange ("سؤال ليك")
-- ==========================================================
create table question_exchange (
  id uuid primary key default gen_random_uuid(),
  asked_by partner not null,
  question_text text not null,
  answer_text text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table question_exchange enable row level security;

-- Seed question, asked by Moaz, waiting for حنونة's answer.
insert into question_exchange (asked_by, question_text)
values ('moaz', 'ممكن تنسيني في يوم من الايام؟');

-- ==========================================================
-- Shared archive ("الأرشيف")
-- ==========================================================
create table archive_entries (
  id uuid primary key default gen_random_uuid(),
  author partner not null,
  content text not null,
  photo_path text,
  created_at timestamptz not null default now()
);

alter table archive_entries enable row level security;

-- ==========================================================
-- Time-locked messages
-- ==========================================================
create table locked_messages (
  id uuid primary key default gen_random_uuid(),
  written_by partner not null,
  recipient partner not null,
  content text not null,
  unlock_at timestamptz not null,
  seen_unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table locked_messages enable row level security;

-- ==========================================================
-- Shared memory photos
-- ==========================================================
create table memory_photos (
  id uuid primary key default gen_random_uuid(),
  uploaded_by partner not null,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

alter table memory_photos enable row level security;

-- ==========================================================
-- Playlist songs
-- ==========================================================
create table playlist_songs (
  id uuid primary key default gen_random_uuid(),
  uploaded_by partner not null,
  title text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table playlist_songs enable row level security;

-- ==========================================================
-- Shared dreams / goals ("أحلامنا")
-- ==========================================================
create table shared_dreams (
  id uuid primary key default gen_random_uuid(),
  added_by partner not null,
  content text not null,
  achieved boolean not null default false,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table shared_dreams enable row level security;

-- ==========================================================
-- Presence (who's currently on the site) — lightweight, overwritten in place
-- ==========================================================
create table presence (
  who partner primary key,
  last_seen_at timestamptz not null default now()
);

insert into presence (who, last_seen_at) values ('moaz', now() - interval '1 day');
insert into presence (who, last_seen_at) values ('hanona', now() - interval '1 day');

alter table presence enable row level security;

alter table presence add column has_seen_story boolean not null default false;

-- ==========================================================
-- Visit counter (drives the visit-based surprise variants)
-- ==========================================================
create table visit_log (
  id uuid primary key default gen_random_uuid(),
  who partner not null,
  visited_at timestamptz not null default now()
);

alter table visit_log enable row level security;

-- ==========================================================
-- Storage buckets
-- Marked public so getPublicUrl() works directly — actual access to the
-- site (and therefore to these links) is already gated by the shared
-- password at the application layer.
-- ==========================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('songs', 'songs', true)
on conflict (id) do nothing;
