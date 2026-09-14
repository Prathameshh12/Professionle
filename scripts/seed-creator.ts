/* eslint-disable no-console */
import "dotenv/config";
import { pool, toVectorLiteral } from "../src/lib/db";
import { embed } from "../src/lib/embeddings";
import { CREATOR_JOB } from "./creator-data";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Seeding creator profile: ${CREATOR_JOB.title}`);

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
    [
      CREATOR_JOB.title,
      CREATOR_JOB.synonyms,
      CREATOR_JOB.difficulty,
      CREATOR_JOB.tags,
      CREATOR_JOB.profile_prose,
      CREATOR_JOB.hint_1,
      CREATOR_JOB.hint_2,
    ]
  );
  const jobId = rows[0].id;
  console.log(`  -> job id: ${jobId}`);

  await pool.query(`delete from question_cache where job_id = $1 and source = 'seed'`, [jobId]);

  for (const item of CREATOR_JOB.faq) {
    const embedding = await embed(item.question);
    await pool.query(
      `insert into question_cache (job_id, question_text, question_embedding, canonical_answer, source)
       values ($1, $2, $3::vector, $4, 'seed')`,
      [jobId, item.question, toVectorLiteral(embedding), item.answer]
    );
    await sleep(150);
  }
  console.log(`  cached ${CREATOR_JOB.faq.length} FAQ entries`);

  await pool.query("analyze question_cache");
  await pool.end();
}

main().catch((err) => {
  console.error("Creator seed failed:", err);
  process.exit(1);
});