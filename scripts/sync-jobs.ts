/* eslint-disable no-console */
/**
 * Pushes edits made in scripts/jobs-data.ts and scripts/jobs-generated.json to the database
 * for jobs that are already loaded. (seed.ts and seed-generated.ts never change existing rows.)
 *
 *   npm run sync:jobs          DRY RUN. Shows exactly what would change. Writes nothing.
 *   npm run sync:jobs:apply    Does it, all in one transaction (all or nothing).
 *
 * It only calls the embedding service if some cached answers are missing (about one call per second).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { JOBS } from "./jobs-data";
import { CREATOR_TAG } from "../src/lib/constants";
import { embed } from "../src/lib/embeddings";
import { addMissingFaq, syncJobs, type SyncJob } from "./sync-lib";
import type { GeneratedJob } from "./generator-lib";

async function main() {
  const apply = process.argv[2] === "apply";
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. Add it to your .env file.");

  const generatedFile = path.resolve(process.cwd(), "scripts", "jobs-generated.json");
  const generated: GeneratedJob[] = fs.existsSync(generatedFile)
    ? JSON.parse(fs.readFileSync(generatedFile, "utf8"))
    : [];

  const jobs: SyncJob[] = [
    ...JOBS.map((j) => ({ ...j })),
    ...generated.filter((j) => j.approved && !j.tags.includes(CREATOR_TAG)),
  ];
  console.log(`${jobs.length} jobs in files (${JOBS.length} hand-written, ${jobs.length - JOBS.length} generated).`);
  console.log(apply ? "APPLYING changes.\n" : "DRY RUN. Nothing will be written.\n");

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const report = await syncJobs(client, jobs);

    // Cached answers that exist in the files but not in the database (about one embedding per second).
    let addedFaq = 0;
    if (apply && report.missingFaq.length) {
      const distinct = new Set(report.missingFaq.map((m) => m.question)).size;
      console.log(`Adding ${report.missingFaq.length} missing cached answer(s), ${distinct} embedding call(s), please wait...`);
      addedFaq = await addMissingFaq(client, report.missingFaq, embed, 1100);
    }

    if (apply) await client.query("commit");
    else await client.query("rollback");

    if (report.lines.length) console.log(report.lines.join("\n") + "\n");
    else console.log("Everything already matches the files.\n");
    console.log(
      `${apply ? "Applied" : "Would apply"}: ${report.jobsUpdated} job(s) updated, ${report.answersUpdated} cached answer(s) corrected, ` +
        `${report.staleCacheDeleted} stale learned answer(s) removed.`
    );
    if (report.missingJobs.length) {
      console.log(`Not in the database yet (run npm run seed / npm run seed:generated): ${report.missingJobs.join(", ")}`);
    }
    if (report.missingFaq.length) {
      const byJob = new Map<string, string[]>();
      for (const m of report.missingFaq) byJob.set(m.title, [...(byJob.get(m.title) ?? []), `${m.question} (${m.answer})`]);
      console.log(`\n${apply ? "Added" : "Would add"} ${apply ? addedFaq : report.missingFaq.length} cached answer(s) that were missing:`);
      for (const [title, qs] of byJob) console.log(`- ${title}: ${qs.join(" | ")}`);
    }
    if (!apply && report.jobsUpdated + report.answersUpdated + report.staleCacheDeleted + report.missingFaq.length > 0) {
      console.log("\nLooks right? Run: npm run sync:jobs:apply");
    }
  } catch (err) {
    try {
      await client.query("rollback");
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Sync failed, nothing was changed:", err);
  process.exit(1);
});