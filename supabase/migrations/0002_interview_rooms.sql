-- Interview mode (Special Cases) — a lightweight two-player room, polled
-- rather than real-time, so it needs no infrastructure beyond Postgres.
-- One real human privately holds a real job (copied from `jobs` at creation
-- time, so it stays frozen for the round even if the source job is later
-- edited or reseeded) and answers honestly by hand — no LLM anywhere here.

create table if not exists interview_rooms (
  id uuid primary key default uuid_generate_v4(),
  room_code text not null,
  job_id uuid references jobs(id) on delete set null,
  job_title text not null,
  job_profile_prose text not null,
  answerer_token uuid not null default uuid_generate_v4(),
  asker_token uuid,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'ended')),
  end_reason text check (end_reason in ('solved', 'gave_up')),
  pending_question boolean not null default false,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 hours')
);

create unique index if not exists interview_rooms_code_uidx on interview_rooms (room_code);

create table if not exists interview_messages (
  seq bigserial primary key,
  room_id uuid not null references interview_rooms(id) on delete cascade,
  kind text not null check (kind in ('question', 'answer', 'solved', 'gave_up', 'joined')),
  content text,
  created_at timestamptz not null default now()
);

create index if not exists interview_messages_room_seq_idx on interview_messages (room_id, seq);