/* The logic behind scripts/sync-jobs.ts, kept separate so it can be tested without a real database. */

import { toVectorLiteral } from "../src/lib/db";
export interface Db {
  query(text: string, params?: unknown[]): Promise<{ rows: any[]; rowCount?: number | null }>;
}

export interface SyncJob {
  title: string;
  synonyms: string[];
  difficulty: string;
  tags: string[];
  profile_prose: string;
  hint_1: string;
  hint_2: string;
  faq: { question: string; answer: string }[];
}

export interface SyncReport {
  lines: string[];
  jobsChecked: number;
  jobsUpdated: number;
  answersUpdated: number;
  staleCacheDeleted: number;
  missingJobs: string[];
  missingFaqRows: number;
  missingFaq: { jobId: string; title: string; question: string; answer: string }[];
}

const FIELDS = ["synonyms", "difficulty", "tags", "profile_prose", "hint_1", "hint_2"] as const;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
/** Letters and digits only, so a hyphen or quote clean-up does not count as a real change to the profile. */
const lettersOnly = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Brings existing database rows in line with the files. It never inserts a job
 * and never calls an AI service. For each job it:
 *  1. updates synonyms / difficulty / tags / profile / hints if they differ
 *  2. updates the cached 'seed' answers whose answer differs (matched by question text)
 *  3. deletes learned ('llm') cache rows that sit within 0.9 similarity of a changed seed answer,
 *     because those would keep serving the old answer to reworded questions
 *  4. if the profile wording really changed (not just hyphens or quotes), deletes that job's learned rows,
 *     since the AI wrote them from the old text
 */
export async function syncJobs(db: Db, jobs: SyncJob[]): Promise<SyncReport> {
  const r: SyncReport = {
    lines: [], jobsChecked: 0, jobsUpdated: 0, answersUpdated: 0,
    staleCacheDeleted: 0, missingJobs: [], missingFaqRows: 0, missingFaq: [],
  };

  for (const job of jobs) {
    r.jobsChecked++;
    const found = await db.query(
      `select id, synonyms, difficulty, tags, profile_prose, hint_1, hint_2 from jobs where lower(title) = lower($1)`,
      [job.title]
    );
    const row = found.rows[0];
    if (!row) {
      r.missingJobs.push(job.title);
      continue;
    }

    const changedFields = FIELDS.filter((f) => !same(row[f], job[f]));
    if (changedFields.length) {
      await db.query(
        `update jobs set synonyms = $2, difficulty = $3, tags = $4, profile_prose = $5, hint_1 = $6, hint_2 = $7 where id = $1`,
        [row.id, job.synonyms, job.difficulty, job.tags, job.profile_prose, job.hint_1, job.hint_2]
      );
      r.jobsUpdated++;
    }

    const seeded = await db.query(
      `select id, question_text, canonical_answer from question_cache where job_id = $1 and source = 'seed'`,
      [row.id]
    );
    const byQuestion = new Map<string, { id: string; canonical_answer: string }>();
    for (const s of seeded.rows) byQuestion.set(s.question_text, s);

    const changedSeedIds: string[] = [];
    const answerNotes: string[] = [];
    for (const item of job.faq) {
      const existing = byQuestion.get(item.question);
      if (!existing) {
        if (!r.missingFaq.some((m) => m.jobId === row.id && m.question === item.question)) {
          r.missingFaqRows++;
          r.missingFaq.push({ jobId: row.id, title: job.title, question: item.question, answer: item.answer });
        }
        continue;
      }
      if (existing.canonical_answer !== item.answer) {
        await db.query(`update question_cache set canonical_answer = $2 where id = $1`, [existing.id, item.answer]);
        changedSeedIds.push(existing.id);
        answerNotes.push(`${item.question} ${existing.canonical_answer} -> ${item.answer}`);
        r.answersUpdated++;
      }
    }

    let deleted = 0;
    if (changedFields.includes("profile_prose") && lettersOnly(row.profile_prose) !== lettersOnly(job.profile_prose)) {
      const del = await db.query(`delete from question_cache where job_id = $1 and source = 'llm' returning id`, [row.id]);
      deleted += del.rows.length;
    }
    if (changedSeedIds.length) {
      const del = await db.query(
        `delete from question_cache c
         using question_cache s
         where s.id = any($1::uuid[])
           and c.job_id = s.job_id
           and c.source = 'llm'
           and 1 - (c.question_embedding <=> s.question_embedding) >= 0.9
         returning c.id`,
        [changedSeedIds]
      );
      deleted += del.rows.length;
    }
    r.staleCacheDeleted += deleted;

    if (changedFields.length || answerNotes.length || deleted) {
      r.lines.push(`- ${job.title}`);
      if (changedFields.length) r.lines.push(`    updated: ${changedFields.join(", ")}`);
      for (const n of answerNotes) r.lines.push(`    answer: ${n}`);
      if (deleted) r.lines.push(`    removed ${deleted} stale learned answer(s)`);
    }
  }
  return r;
}


/** Adds the cached answers that are missing from the database. Embeds each distinct question once. */
export async function addMissingFaq(
  db: Db,
  missing: SyncReport["missingFaq"],
  embed: (text: string) => Promise<number[]>,
  pauseMs = 0
): Promise<number> {
  const vectors = new Map<string, number[]>();
  let added = 0;
  for (const m of missing) {
    let v = vectors.get(m.question);
    if (!v) {
      v = await embed(m.question);
      vectors.set(m.question, v);
      if (pauseMs) await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
    await db.query(
      `insert into question_cache (job_id, question_text, question_embedding, canonical_answer, source)
       values ($1, $2, $3::vector, $4, 'seed')`,
      [m.jobId, m.question, toVectorLiteral(v), m.answer]
    );
    added++;
  }
  return added;
}