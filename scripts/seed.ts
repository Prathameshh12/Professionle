/* eslint-disable no-console */
import "dotenv/config";
import { pool, toVectorLiteral } from "../src/lib/db";
import { embed } from "../src/lib/embeddings";
import { JOBS } from "./jobs-data";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Seeding ${JOBS.length} jobs...`);

  for (const job of JOBS) {
    const { rows } = await pool.query(
      `insert into jobs (title, synonyms, difficulty, tags, profile_prose, hint_1, hint_2)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (lower(title)) do update set
         synonyms = excluded.synonyms,
         difficulty = excluded.difficulty,
         tags = excluded.tags,
         profile_prose = excluded.profile_prose,
         hint_1 = excluded.hint_1,
         hint_2 = excluded.hint_2
       returning id`,
      [job.title, job.synonyms, job.difficulty, job.tags, job.profile_prose, job.hint_1, job.hint_2]
    );
    const jobId = rows[0].id;
    console.log(`  - ${job.title} (${jobId})`);

    // Clear any previously seeded FAQ cache for this job so re-running the
    // script doesn't duplicate entries (learned "llm"-sourced entries are left alone).
    await pool.query(`delete from question_cache where job_id = $1 and source = 'seed'`, [jobId]);

    for (const item of job.faq) {
      const embedding = await embed(item.question);
      await pool.query(
        `insert into question_cache (job_id, question_text, question_embedding, canonical_answer, source)
         values ($1, $2, $3::vector, $4, 'seed')`,
        [jobId, item.question, toVectorLiteral(embedding), item.answer]
      );
      // Gemini's free tier is generous but still rate-limited; a small pause
      // keeps seeding comfortably under it across ~300 embedding calls.
      await sleep(150);
    }
    console.log(`    cached ${job.faq.length} FAQ entries`);
  }

  console.log("Done. Re-run `analyze` on question_cache periodically for ivfflat index quality:");
  console.log("  ANALYZE question_cache;");
  await pool.query("analyze question_cache");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
