import { pool } from "./db";
import type { Difficulty, GameSession, Job } from "@/types";
import { CREATOR_TAG } from "./constants";

function mapSession(row: any): GameSession {
  return {
    id: row.id,
    job_id: row.job_id,
    user_id: row.user_id,
    no_count: row.no_count,
    total_questions: row.total_questions,
    hints_revealed: row.hints_revealed ?? [],
    status: row.status,
    created_at: row.created_at,
    ended_at: row.ended_at,
  };
}

function mapJob(row: any): Job {
  return {
    id: row.id,
    title: row.title,
    synonyms: row.synonyms ?? [],
    difficulty: row.difficulty,
    tags: row.tags ?? [],
    profile_prose: row.profile_prose,
    hint_1: row.hint_1,
    hint_2: row.hint_2,
  };
}

/** Assigns a random job (optionally filtered by difficulty) and opens a session. */
export async function startSession(
  difficulty?: Difficulty,
  userId?: string
): Promise<GameSession> {
  const jobQuery = difficulty
    ? `select id from jobs where difficulty = $1 and not ($2 = any(tags)) order by random() limit 1`
    : `select id from jobs where not ($1 = any(tags)) order by random() limit 1`;
  const jobParams = difficulty ? [difficulty, CREATOR_TAG] : [CREATOR_TAG];
  const { rows: jobRows } = await pool.query(jobQuery, jobParams);
  if (jobRows.length === 0) {
    throw new Error("No jobs available in the database. Run `npm run seed` first.");
  }
  const jobId = jobRows[0].id;

  const { rows } = await pool.query(
    `insert into game_sessions (job_id, user_id) values ($1, $2) returning *`,
    [jobId, userId ?? null]
  );
  return mapSession(rows[0]);
}

/** Starts a session pinned to the single creator-profile job, bypassing the random draw. */
export async function startCreatorSession(userId?: string): Promise<GameSession> {
  const { rows: jobRows } = await pool.query(
    `select id from jobs where $1 = any(tags) limit 1`,
    [CREATOR_TAG]
  );
  if (jobRows.length === 0) {
    throw new Error("Creator profile not seeded yet. Run `npm run seed:creator` first.");
  }
  const jobId = jobRows[0].id;

  const { rows } = await pool.query(
    `insert into game_sessions (job_id, user_id) values ($1, $2) returning *`,
    [jobId, userId ?? null]
  );
  return mapSession(rows[0]);
}

export async function getSession(sessionId: string): Promise<GameSession | null> {
  const { rows } = await pool.query(`select * from game_sessions where id = $1`, [sessionId]);
  return rows[0] ? mapSession(rows[0]) : null;
}

export async function getJob(jobId: string): Promise<Job | null> {
  const { rows } = await pool.query(`select * from jobs where id = $1`, [jobId]);
  return rows[0] ? mapJob(rows[0]) : null;
}

/** Ends a session early via the "Give up" button, revealing the job. */
export async function giveUp(sessionId: string): Promise<{ session: GameSession; job: Job } | null> {
  const session = await getSession(sessionId);
  if (!session || session.status !== "active") return null;
  const { rows } = await pool.query(
    `update game_sessions set status = 'lost', ended_at = now() where id = $1 returning *`,
    [sessionId]
  );
  const job = await getJob(session.job_id);
  if (!job) return null;
  return { session: mapSession(rows[0]), job };
}
