/* eslint-disable no-console */
/**
 * Loads approved jobs from scripts/jobs-generated.json into Postgres.
 *
 *   npm run seed:generated:dry   shows what would happen, writes nothing
 *   npm run seed:generated       does it
 *
 * Safe to run more than once. It never changes a job that already exists:
 *  - a job whose title is already taken by a different job is skipped
 *  - a job that was only half loaded last time gets its missing FAQ rows repaired
 *  - existing hand-written jobs are never touched
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { pool, toVectorLiteral } from "../src/lib/db";
import { embed } from "../src/lib/embeddings";
import { CREATOR_TAG } from "../src/lib/constants";
import { sleep, type GeneratedJob } from "./generator-lib";

const GENERATED_FILE = path.resolve(process.cwd(), "scripts", "jobs-generated.json");
const EMBED_PAUSE_MS = Number(process.env.EMBED_PAUSE_MS ?? 1100); // Mistral free tier is about 1 request per second

// Every job shares the same FAQ questions, so each question is embedded only once.
const embedCache = new Map<string, number[]>();
async function embedOnce(question: string): Promise<number[]> {
  const hit = embedCache.get(question);
  if (hit) return hit;
  const vector = await embed(question);
  embedCache.set(question, vector);
  await sleep(EMBED_PAUSE_MS);
  return vector;
}

async function main() {
  const dry = process.argv[2] === "dry";
  if (!fs.existsSync(GENERATED_FILE)) {
    console.log("scripts/jobs-generated.json not found. Generate jobs first.");
    return;
  }
  const all = JSON.parse(fs.readFileSync(GENERATED_FILE, "utf8")) as GeneratedJob[];
  const approved = all.filter((j) => j.approved);
  console.log(`${approved.length} approved job(s) out of ${all.length}.${dry ? " DRY RUN, nothing will be written." : ""}\n`);
  if (!approved.length) {
    console.log('Nothing approved yet. Run "npm run gen:approve" first.');
    return;
  }

  let added = 0;
  let repaired = 0;
  let skipped = 0;
  let failed = 0;

  for (const job of approved) {
    try {
      if (job.tags.includes(CREATOR_TAG)) {
        console.log(`- ${job.title}: skipped (uses the reserved creator tag)`);
        skipped++;
        continue;
      }

      const { rows } = await pool.query(`select id, profile_prose from jobs where lower(title) = lower($1)`, [job.title]);
      let jobId: string | null = null;
      let mode: "new" | "repair" = "new";

      if (rows[0]) {
        if (rows[0].profile_prose !== job.profile_prose) {
          console.log(`- ${job.title}: skipped (a different job already uses this title)`);
          skipped++;
          continue;
        }
        jobId = rows[0].id as string;
        const { rows: counts } = await pool.query(
          `select count(*)::int as n from question_cache where job_id = $1 and source = 'seed'`,
          [jobId]
        );
        if (counts[0].n >= job.faq.length) {
          console.log(`- ${job.title}: already loaded`);
          skipped++;
          continue;
        }
        mode = "repair";
      }

      if (dry) {
        console.log(`- ${job.title}: would ${mode === "new" ? "add" : "repair"} (${job.faq.length} FAQ answers)`);
        mode === "new" ? added++ : repaired++;
        continue;
      }

      // Embed first, so the database writes below happen back to back.
      const vectors: number[][] = [];
      for (const item of job.faq) vectors.push(await embedOnce(item.question));

      if (mode === "new") {
        const inserted = await pool.query(
          `insert into jobs (title, synonyms, difficulty, tags, profile_prose, hint_1, hint_2)
           values ($1, $2, $3, $4, $5, $6, $7) returning id`,
          [job.title, job.synonyms, job.difficulty, job.tags, job.profile_prose, job.hint_1, job.hint_2]
        );
        jobId = inserted.rows[0].id as string;
      } else {
        await pool.query(`delete from question_cache where job_id = $1 and source = 'seed'`, [jobId]);
      }

      for (let i = 0; i < job.faq.length; i++) {
        await pool.query(
          `insert into question_cache (job_id, question_text, question_embedding, canonical_answer, source)
           values ($1, $2, $3::vector, $4, 'seed')`,
          [jobId, job.faq[i].question, toVectorLiteral(vectors[i]), job.faq[i].answer]
        );
      }
      console.log(`- ${job.title}: ${mode === "new" ? "added" : "repaired"} with ${job.faq.length} FAQ answers`);
      mode === "new" ? added++ : repaired++;
    } catch (err) {
      failed++;
      console.log(`- ${job.title}: FAILED (${(err as Error).message}). Run the command again to retry it.`);
    }
  }

  if (!dry && added + repaired > 0) await pool.query("analyze question_cache");
  console.log(`\nAdded ${added}, repaired ${repaired}, skipped ${skipped}, failed ${failed}.`);
  if (failed) process.exitCode = 1;
  await pool.end();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});