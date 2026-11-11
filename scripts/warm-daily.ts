/* eslint-disable no-console */
/**
 * Gets the next few days of daily puzzles ready.
 *
 *   npm run warm-daily            the next 7 days
 *   npm run warm-daily -- 14      the next 14 days (1 to 30)
 *   npm run warm-daily -- 7 show  also prints the job titles (spoilers!)
 *
 * For each day it makes sure a puzzle exists, then asks the usual questions about that job
 * and saves the answers. On the day, most questions are then answered instantly.
 *
 * Safe to run again at any time. Anything already saved is skipped, so if the model's rate
 * limit stops the run, just run it again later and it carries on.
 */
import "dotenv/config";
import { pool, toVectorLiteral } from "../src/lib/db";
import { embed } from "../src/lib/embeddings";
import { llm } from "../src/lib/llm";
import { addDays, getOrCreatePuzzle, todayInZone, DAILY_TIMEZONE } from "../src/lib/daily";
import { WARM_QUESTIONS, warmJobs, type WarmDeps, type WarmJob } from "./warm-lib";

// Same thresholds the game itself uses (src/lib/pipeline.ts).
const OVERRIDE_SIMILARITY_THRESHOLD = 0.92;
const CACHE_SIMILARITY_THRESHOLD = 0.9;

const MIN_DAYS = 1;
const MAX_DAYS = 30;

function readArgs(): { days: number; show: boolean } {
  const rest = process.argv.slice(2).filter((a) => a !== "--");
  let days = 7;
  let show = false;
  for (const arg of rest) {
    if (arg.toLowerCase() === "show") show = true;
    else if (/^\d+$/.test(arg)) days = Number(arg);
    else throw new Error(`Unknown argument "${arg}". Use a number of days, and optionally the word show.`);
  }
  if (days < MIN_DAYS || days > MAX_DAYS) throw new Error(`Days must be between ${MIN_DAYS} and ${MAX_DAYS}.`);
  return { days, show };
}

const realDeps: WarmDeps = {
  embed,
  async hasOverride(jobId, embedding) {
    const { rows } = await pool.query(
      `select 1 - (question_embedding <=> $1::vector) as sim
       from answer_overrides
       where job_id = $2
       order by question_embedding <=> $1::vector
       limit 1`,
      [toVectorLiteral(embedding), jobId]
    );
    return !!rows[0] && rows[0].sim >= OVERRIDE_SIMILARITY_THRESHOLD;
  },
  async hasCache(jobId, embedding) {
    const { rows } = await pool.query(
      `select 1 - (question_embedding <=> $1::vector) as sim
       from question_cache
       where job_id = $2
       order by question_embedding <=> $1::vector
       limit 1`,
      [toVectorLiteral(embedding), jobId]
    );
    return !!rows[0] && rows[0].sim >= CACHE_SIMILARITY_THRESHOLD;
  },
  answer: (job, question) =>
    llm.answerQuestion({ profileProse: job.profile_prose, tags: job.tags, history: [], question }),
  async store(jobId, question, embedding, answer) {
    await pool.query(
      `insert into question_cache (job_id, question_text, question_embedding, canonical_answer, source)
       values ($1, $2, $3::vector, $4, 'llm')`,
      [jobId, question, toVectorLiteral(embedding), answer]
    );
  },
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  log: (line) => console.log(line),
};

async function main() {
  const { days, show } = readArgs();
  const today = todayInZone();
  console.log(`Preparing ${days} day(s) from ${today} (${DAILY_TIMEZONE}).${show ? "" : " Job titles are hidden so you do not spoil the puzzles."}\n`);

  const jobs: WarmJob[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    const puzzle = await getOrCreatePuzzle(date);
    const { rows } = await pool.query(`select id, title, tags, profile_prose from jobs where id = $1`, [puzzle.jobId]);
    const job = rows[0];
    if (!job) throw new Error(`Puzzle ${date} points to a job that no longer exists.`);
    console.log(`Puzzle #${puzzle.number}  ${date}${show ? `  ${job.title}` : ""}`);
    jobs.push({
      id: job.id,
      label: `#${puzzle.number} ${date}${show ? ` ${job.title}` : ""}`,
      title: job.title,
      tags: job.tags ?? [],
      profile_prose: job.profile_prose,
    });
  }

  console.log(`\nWarming ${jobs.length} job(s) with ${WARM_QUESTIONS.length} questions each.\n`);

  const summary = await warmJobs(jobs, WARM_QUESTIONS, realDeps, {
    delayMs: Number(process.env.WARM_DELAY_MS ?? 8000), // keeps Groq's free tier happy
    embedDelayMs: Number(process.env.EMBED_PAUSE_MS ?? 1100), // Mistral free tier: about 1 request a second
    maxWaitMs: 120_000,
  });

  if (summary.asked > 0) await pool.query("analyze question_cache");

  console.log(
    `\nDone. ${summary.asked} new answer(s) saved, ${summary.alreadyCached} were already saved, ` +
      `${summary.overridden} covered by overrides, ${summary.failed} failed.`
  );
  if (summary.stoppedBecause) {
    console.log(`\nStopped early: ${summary.stoppedBecause}`);
    process.exitCode = 1;
  } else if (summary.failed > 0) {
    process.exitCode = 1;
  }
  await pool.end();
}

main().catch(async (err) => {
  console.error("warm-daily failed:", err instanceof Error ? err.message : err);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});