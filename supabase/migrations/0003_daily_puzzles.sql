-- Daily puzzle mode.
-- Run this once in the Supabase SQL editor BEFORE deploying the daily code.

-- One row per calendar day (in the daily timezone, Sydney by default) pointing at that day's job.
-- The primary key on puzzle_date is what guarantees two simultaneous visitors can never get different jobs.
create table if not exists daily_puzzles (
  puzzle_date date primary key,
  job_id uuid not null references jobs (id),
  created_at timestamptz not null default now()
);

create index if not exists daily_puzzles_job_idx on daily_puzzles (job_id, puzzle_date desc);

-- Keeps this table (which holds the answers for upcoming days) out of Supabase's public API.
-- The app connects with DATABASE_URL as the table owner, which is not affected by this.
alter table daily_puzzles enable row level security;

-- Lets you see which game sessions were daily puzzles (for stats like plays and win rate per day).
alter table game_sessions add column if not exists puzzle_date date;

create index if not exists game_sessions_puzzle_date_idx
  on game_sessions (puzzle_date)
  where puzzle_date is not null;