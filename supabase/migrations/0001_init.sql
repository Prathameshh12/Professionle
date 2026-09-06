-- "That's My Job" — initial schema
-- Run against a Postgres database with the pgvector extension available
-- (Supabase: Database > Extensions > enable "vector").

create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- jobs: the pool of professions the game can assign
-- ---------------------------------------------------------------------------
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  synonyms text[] not null default '{}',
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  tags text[] not null default '{}',
  profile_prose text not null,
  hint_1 text not null,
  hint_2 text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists jobs_title_uidx on jobs (lower(title));

-- ---------------------------------------------------------------------------
-- question_cache: pre-seeded + learned (question -> answer) pairs, per job
-- Embeddings use Gemini's text-embedding-004 model, which returns 768-dim
-- vectors. Change the dimension below if you swap embedding providers.
-- ---------------------------------------------------------------------------
create table if not exists question_cache (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs (id) on delete cascade,
  question_text text not null,
  question_embedding vector(768) not null,
  canonical_answer text not null check (
    canonical_answer in ('yes', 'no', 'sometimes', 'not_really', 'irrelevant')
  ),
  source text not null check (source in ('seed', 'llm')),
  hit_count integer not null default 0,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create index if not exists question_cache_job_idx on question_cache (job_id);

-- ivfflat needs rows to train lists on; on a fresh DB this will still work,
-- just less optimally until there is real data. Re-run `analyze` after seeding.
create index if not exists question_cache_embedding_idx
  on question_cache using ivfflat (question_embedding vector_cosine_ops)
  with (lists = 100);

-- ---------------------------------------------------------------------------
-- answer_overrides: admin-entered corrections, checked before cache/LLM
-- ---------------------------------------------------------------------------
create table if not exists answer_overrides (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs (id) on delete cascade,
  question_pattern text not null,
  question_embedding vector(768) not null,
  forced_answer text not null check (
    forced_answer in ('yes', 'no', 'sometimes', 'not_really', 'irrelevant')
  ),
  created_at timestamptz not null default now()
);

create index if not exists answer_overrides_job_idx on answer_overrides (job_id);
create index if not exists answer_overrides_embedding_idx
  on answer_overrides using ivfflat (question_embedding vector_cosine_ops)
  with (lists = 50);

-- ---------------------------------------------------------------------------
-- game_sessions: one row per game played
-- ---------------------------------------------------------------------------
create table if not exists game_sessions (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs (id),
  user_id uuid,
  no_count integer not null default 0,
  total_questions integer not null default 0,
  hints_revealed integer[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'won', 'lost')),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists game_sessions_status_idx on game_sessions (status);

-- ---------------------------------------------------------------------------
-- question_log: every question asked in every session, for later tuning
-- ---------------------------------------------------------------------------
create table if not exists question_log (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references game_sessions (id) on delete cascade,
  question_text text not null,
  resolved_answer text not null check (
    resolved_answer in ('yes', 'no', 'sometimes', 'not_really', 'irrelevant')
  ),
  was_guess_attempt boolean not null default false,
  source text not null check (source in ('override', 'cache', 'llm', 'tag', 'guess')),
  created_at timestamptz not null default now()
);

create index if not exists question_log_session_idx on question_log (session_id);
create index if not exists question_log_created_idx on question_log (created_at desc);
