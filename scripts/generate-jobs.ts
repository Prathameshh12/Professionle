/* eslint-disable no-console */
/**
 * Offline job generator. It never touches your database or the game.
 *
 *   titles [count]   ask Groq to suggest new job titles -> scripts/job-titles.txt
 *   jobs [limit]     generate a full entry for each title -> scripts/jobs-generated.json
 *   review           write scripts/jobs-review.md so you can read everything easily
 *   approve all      mark every generated job as approved (or: approve "Title" "Title")
 *   reject "Title"   mark specific jobs as not approved
 *   status           show counts
 *
 * Seeding the approved jobs into Postgres is a separate step: scripts/seed-generated.ts
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { JOBS } from "./jobs-data";
import { CREATOR_JOB } from "./creator-data";
import {
  FAQ_LABELS,
  GroqFatalError,
  buildJobPrompt,
  buildTitlesPrompt,
  findConflict,
  groqJson,
  leaksTitle,
  normalize,
  sleep,
  validateGenerated,
  DEFAULT_MODEL,
  type GeneratedJob,
} from "./generator-lib";

const SCRIPTS_DIR = path.resolve(process.cwd(), "scripts");
const TITLES_FILE = path.join(SCRIPTS_DIR, "job-titles.txt");
const GENERATED_FILE = path.join(SCRIPTS_DIR, "jobs-generated.json");
const REVIEW_FILE = path.join(SCRIPTS_DIR, "jobs-review.md");

const DELAY_MS = Number(process.env.GEN_DELAY_MS ?? 8000);
const MAX_ATTEMPTS_PER_JOB = 3;

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------
function readGenerated(): GeneratedJob[] {
  if (!fs.existsSync(GENERATED_FILE)) return [];
  const parsed = JSON.parse(fs.readFileSync(GENERATED_FILE, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("jobs-generated.json must contain a JSON array.");
  return parsed as GeneratedJob[];
}

function writeGenerated(jobs: GeneratedJob[]) {
  const tmp = `${GENERATED_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(jobs, null, 2) + "\n");
  fs.renameSync(tmp, GENERATED_FILE); // atomic, so a crash never leaves half a file
}

function readTitles(): string[] {
  if (!fs.existsSync(TITLES_FILE)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of fs.readFileSync(TITLES_FILE, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    if (seen.has(normalize(t))) continue;
    seen.add(normalize(t));
    out.push(t);
  }
  return out;
}

/** Titles of jobs that already exist in your hand-written data. */
function existingTitles(): string[] {
  return [...JOBS.map((j) => j.title), CREATOR_JOB.title];
}

function commonTags(generated: GeneratedJob[]): string[] {
  const counts = new Map<string, number>();
  for (const tags of [...JOBS.map((j) => j.tags), ...generated.map((j) => j.tags)]) {
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([t]) => t);
}

// ---------------------------------------------------------------------------
// titles
// ---------------------------------------------------------------------------
async function cmdTitles(count: number) {
  const generated = readGenerated();
  const known = [...existingTitles(), ...generated.map((j) => j.title), ...readTitles()];
  const ask = Math.min(count * 2, 120); // ask for extra, some will be rejected

  console.log(`Asking Groq for about ${ask} candidate titles...`);
  const raw = (await groqJson(buildTitlesPrompt(ask, known, commonTags(generated)), {
    temperature: 0.8,
    maxTokens: 3000,
  })) as { titles?: unknown };
  const candidates = Array.isArray(raw?.titles) ? raw.titles : [];

  const accepted: string[] = [];
  const pool = [...known];
  let rejected = 0;
  for (const c of candidates) {
    if (accepted.length >= count) break;
    if (typeof c !== "string") continue;
    const title = c.trim().replace(/^["'\s]+|["'\s]+$/g, "");
    if (title.length < 3 || title.length > 40 || !/^[\p{L}][\p{L}' \-]+$/u.test(title)) {
      rejected++;
      continue;
    }
    const clash = findConflict(title, pool);
    if (clash) {
      console.log(`  skipped "${title}" (too close to "${clash}")`);
      rejected++;
      continue;
    }
    accepted.push(title);
    pool.push(title);
  }

  if (!accepted.length) {
    console.log("No usable titles came back. Run the command again.");
    return;
  }
  const header = `\n# Added ${new Date().toISOString().slice(0, 10)} by gen:titles. Delete any line you do not want.\n`;
  fs.appendFileSync(TITLES_FILE, header + accepted.join("\n") + "\n");
  console.log(`\nAdded ${accepted.length} titles to scripts/job-titles.txt (${rejected} rejected). Open it and delete any you do not like.`);
}

// ---------------------------------------------------------------------------
// jobs
// ---------------------------------------------------------------------------
async function cmdJobs(limit: number) {
  const generated = readGenerated();
  const done = new Set(generated.map((j) => normalize(j.title)));
  const handWritten = existingTitles();
  const allTitles = readTitles();
  if (!allTitles.length) {
    console.log("scripts/job-titles.txt is empty or missing. Create it first (see the steps).");
    return;
  }

  // Drop titles that clash with a hand-written job or an earlier title in the file.
  const todo: string[] = [];
  for (const title of allTitles) {
    if (done.has(normalize(title))) continue;
    const clash = findConflict(title, [...handWritten, ...todo]);
    if (clash) {
      console.log(`Skipping "${title}": too close to "${clash}" (the game would accept the same guesses for both).`);
      continue;
    }
    todo.push(title);
  }

  const batch = todo.slice(0, limit);
  if (!batch.length) {
    console.log("Nothing left to generate. Every title in job-titles.txt already has an entry.");
    return;
  }
  const model = process.env.GEN_MODEL || DEFAULT_MODEL;
  console.log(`Generating ${batch.length} of ${todo.length} remaining job(s) with ${model}. Delay between calls: ${DELAY_MS / 1000}s.\n`);

  const failed: string[] = [];
  let stopped = false;

  for (let i = 0; i < batch.length && !stopped; i++) {
    const title = batch[i];
    const label = `[${i + 1}/${batch.length}] ${title}`;
    const otherTitles = [...handWritten, ...generated.map((j) => j.title), ...allTitles.filter((t) => t !== title)];
    let errors: string[] = [];
    let saved = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_JOB && !saved; attempt++) {
      try {
        const raw = await groqJson(buildJobPrompt(title, commonTags(generated), errors), { temperature: 0.3 });
        const result = validateGenerated(raw, title, otherTitles);
        if (result.ok) {
          generated.push({ ...result.job, approved: false, generatedAt: new Date().toISOString(), model });
          writeGenerated(generated); // saved after every job, so nothing is lost if you stop
          const words = result.job.profile_prose.split(/\s+/).length;
          console.log(`${label} ok (${result.job.difficulty}, ${words} words, tags: ${result.job.tags.join(", ")})`);
          saved = true;
        } else {
          errors = result.errors;
          console.log(`${label} attempt ${attempt} rejected: ${result.errors.join(" | ")}`);
        }
      } catch (err) {
        if (err instanceof GroqFatalError) {
          console.log(`\n${err.message}`);
          if (err.kind === "auth") process.exitCode = 1;
          stopped = true;
          break;
        }
        errors = [`Previous response could not be used (${(err as Error).message}). Return valid JSON in the exact shape.`];
        console.log(`${label} attempt ${attempt} failed: ${(err as Error).message}`);
      }
      if (!saved && !stopped && attempt < MAX_ATTEMPTS_PER_JOB) await sleep(DELAY_MS);
    }

    if (!saved && !stopped) {
      failed.push(title);
      console.log(`${label} gave up after ${MAX_ATTEMPTS_PER_JOB} attempts. It stays in job-titles.txt and will be retried next run.`);
    }
    if (i < batch.length - 1 && !stopped) await sleep(DELAY_MS);
  }

  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const j of generated) counts[j.difficulty]++;
  console.log(`\nDone for this run. Total generated so far: ${generated.length} (easy ${counts.easy}, medium ${counts.medium}, hard ${counts.hard}).`);
  if (failed.length) console.log(`Could not generate: ${failed.join(", ")}. Run "npm run gen:jobs" again to retry them.`);
  // Only count titles that can still be generated (not the ones skipped for clashing with an existing job).
  const left = todo.filter((t) => !generated.some((j) => normalize(j.title) === normalize(t))).length;
  if (left > 0) console.log(`${left} title(s) still waiting. Run "npm run gen:jobs" again to continue.`);
  else console.log('Next: run "npm run gen:review", read scripts/jobs-review.md, then approve.');
}

// ---------------------------------------------------------------------------
// review / approve / reject / status
// ---------------------------------------------------------------------------
function cmdReview() {
  const jobs = readGenerated();
  if (!jobs.length) {
    console.log("Nothing generated yet.");
    return;
  }
  const lines: string[] = [];
  const counts = { easy: 0, medium: 0, hard: 0 };
  jobs.forEach((j) => counts[j.difficulty]++);
  lines.push(`# Generated jobs review`, "");
  lines.push(`${jobs.length} jobs: ${counts.easy} easy, ${counts.medium} medium, ${counts.hard} hard.`);
  lines.push("", "What to check on each job: (1) the profile has no wrong facts, (2) the difficulty feels right, (3) the hints do not give the job away, (4) the tags are clearly true.", "");

  const everyTitle = [...existingTitles(), ...jobs.map((j) => j.title)];
  jobs.forEach((j) => {
    lines.push(`## ${j.title}  ${j.approved ? "[approved]" : "[not approved]"}`, "");
    lines.push(`- Difficulty: **${j.difficulty}**`);
    lines.push(`- Tags: ${j.tags.join(", ")}`);
    lines.push(`- Synonyms: ${j.synonyms.length ? j.synonyms.join(", ") : "(none)"}`);
    lines.push(`- Hint 1: ${j.hint_1}`);
    lines.push(`- Hint 2: ${j.hint_2}`);
    const warnings: string[] = [];
    const clash = findConflict(j.title, everyTitle.filter((t) => normalize(t) !== normalize(j.title)));
    if (clash) warnings.push(`title is very close to "${clash}"`);
    for (const [name, hint] of [["hint 1", j.hint_1], ["hint 2", j.hint_2]] as const) {
      const leak = leaksTitle(hint, j.title, j.synonyms);
      if (leak) warnings.push(`${name} may give away the job ("${leak}")`);
    }
    if (warnings.length) lines.push(`- **WARNING:** ${warnings.join("; ")}`);
    lines.push("", j.profile_prose, "");
    lines.push("Answers: " + j.faq.map((f, i) => `${FAQ_LABELS[i] ?? f.question}: ${f.answer.replace("_", " ")}`).join(" | "), "");
  });

  fs.writeFileSync(REVIEW_FILE, lines.join("\n"));
  console.log(`Wrote scripts/jobs-review.md (${jobs.length} jobs). Open it in VS Code and press Ctrl+Shift+V for a readable preview.`);
}

function cmdSetApproval(args: string[], value: boolean) {
  const jobs = readGenerated();
  if (!jobs.length) {
    console.log("Nothing generated yet.");
    return;
  }
  if (!args.length) {
    console.log(`Say which jobs. Example: ${value ? "approve all" : 'reject "Pharmacist"'}`);
    return;
  }
  const all = args.length === 1 && args[0].toLowerCase() === "all";
  const wanted = new Set(args.map(normalize));
  let changed = 0;
  const matched = new Set<string>();
  for (const j of jobs) {
    const hit = all || wanted.has(normalize(j.title));
    if (hit) {
      matched.add(normalize(j.title));
      if (j.approved !== value) changed++;
      j.approved = value;
    }
  }
  if (!all) for (const w of wanted) if (!matched.has(w)) console.log(`No generated job called "${w}".`);
  writeGenerated(jobs);
  console.log(`${value ? "Approved" : "Un-approved"} ${changed} job(s). Total approved now: ${jobs.filter((j) => j.approved).length} of ${jobs.length}.`);
}

function cmdStatus() {
  const generated = readGenerated();
  const titles = readTitles();
  const done = new Set(generated.map((j) => normalize(j.title)));
  console.log(`Titles in job-titles.txt: ${titles.length}`);
  console.log(`Generated: ${generated.length}`);
  console.log(`Approved: ${generated.filter((j) => j.approved).length}`);
  console.log(`Titles still to generate: ${titles.filter((t) => !done.has(normalize(t))).length}`);
}

// ---------------------------------------------------------------------------
async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const num = (s: string | undefined, fallback: number) => {
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
  };
  switch (cmd) {
    case "titles":
      return cmdTitles(num(rest[0], 60));
    case "jobs":
      return cmdJobs(num(rest[0], Infinity));
    case "review":
      return cmdReview();
    case "approve":
      return cmdSetApproval(rest, true);
    case "reject":
      return cmdSetApproval(rest, false);
    case "status":
      return cmdStatus();
    default:
      console.log("Commands: titles [count] | jobs [limit] | review | approve all | reject \"Title\" | status");
  }
}

main().catch((err) => {
  if (err instanceof GroqFatalError) {
    console.error(err.message);
  } else {
    console.error("Failed:", err);
  }
  process.exit(1);
});