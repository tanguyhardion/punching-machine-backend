-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → your project → SQL Editor)
-- or via the Supabase CLI: supabase db push

create table if not exists public.scores (
  id         uuid primary key default gen_random_uuid(),
  player     text not null check (char_length(player) between 1 and 20),
  score      integer not null check (score between 1 and 999),
  power      text not null default 'Arcade Smash' check (char_length(power) <= 28),
  created_at timestamptz not null default now()
);

-- Index so ORDER BY score DESC is fast even with many rows
create index if not exists scores_score_desc_idx on public.scores (score desc);

-- Row Level Security: the Express backend uses the service-role key so it bypasses RLS.
-- Enable RLS anyway to block direct client access (defence in depth).
alter table public.scores enable row level security;

-- No public policies → direct anonymous/authenticated client access is denied.
-- All access goes through the Express backend which uses the service-role key.
