-- Presence tracking for Interview mode: each side's last-seen timestamp
-- updates on every authenticated request they make (polling counts too),
-- so the other side can detect "they've gone quiet" without any real-time
-- infrastructure — just comparing two timestamps.

alter table interview_rooms
  add column if not exists answerer_last_seen_at timestamptz not null default now(),
  add column if not exists asker_last_seen_at timestamptz;
-- asker_last_seen_at starts NULL (not "now()") since there's no asker yet
-- at room creation — it only gets set the moment someone actually joins.