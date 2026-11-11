/**
 * The logic behind `npm run warm-daily`, kept free of database and network code
 * so it can be tested with fakes. scripts/warm-daily.ts plugs in the real ones.
 */
import type { Answer } from "../src/types";

/**
 * Questions players ask most often. Each one is answered once per daily job and saved,
 * so on the day itself the common questions are instant and cost nothing.
 *
 * None of these may start with "Is it", "Is this", "Are you" and so on. The game would treat
 * those as possible guesses. They also avoid the words the tag shortcut listens for.
 * The test in the build notes checks both.
 */
export const WARM_QUESTIONS: string[] = [
  "Do you work in an office?",
  "Do you work in a hospital or clinic?",
  "Do you work in a kitchen?",
  "Do you work on a construction site?",
  "Do you use a computer every day?",
  "Do you use tools or machinery?",
  "Do you wear protective gear?",
  "Do you work night shifts?",
  "Do you work on weekends?",
  "Do you need to be good at maths?",
  "Do you help people as part of your job?",
  "Do you find the job stressful?",
  "Do you work for the government?",
  "Do you work in healthcare?",
  "Do you work in education?",
  "Do you work with money?",
  "Do you work in a trade?",
  "Do you work with food?",
  "Do you drive as part of your job?",
  "Do you work with numbers and data?",
  "Do you make or build things?",
  "Do you sell things to people?",
  "Do you write as part of your job?",
  "Do you need to be physically fit?",
  "Can you do the job from home?",
  "Does the job take years of training?",
  "Do you work with vehicles?",
  "Do you spend most of the day on your feet?",
  "Do you work with chemicals?",
  "Do you perform in front of an audience?",
];

export interface WarmJob {
  id: string;
  /** What to print in the log. Usually the date, with the title only if the player asked to see it. */
  label: string;
  title: string;
  tags: string[];
  profile_prose: string;
}

export interface WarmDeps {
  embed(question: string): Promise<number[]>;
  hasOverride(jobId: string, embedding: number[]): Promise<boolean>;
  hasCache(jobId: string, embedding: number[]): Promise<boolean>;
  answer(job: WarmJob, question: string): Promise<Answer>;
  store(jobId: string, question: string, embedding: number[], answer: Answer): Promise<void>;
  sleep(ms: number): Promise<void>;
  log(line: string): void;
}

export interface WarmOptions {
  /** Pause after every model call, to stay under the free rate limit. */
  delayMs: number;
  /** Pause after every new embedding call. */
  embedDelayMs: number;
  /** If the provider says to wait longer than this, stop instead of waiting. */
  maxWaitMs: number;
}

export interface WarmSummary {
  asked: number;
  alreadyCached: number;
  overridden: number;
  failed: number;
  /** Why the run stopped early, or null if every question was handled. */
  stoppedBecause: string | null;
}

const MAX_RATE_LIMIT_RETRIES = 2;
const MAX_FAILURES_IN_A_ROW = 5;

export function isRateLimit(err: unknown): boolean {
  const e = err as { status?: number; message?: string } | null;
  if (e?.status === 429) return true;
  return /\b429\b|rate limit/i.test(e?.message ?? "");
}

/**
 * Reads the wait time out of a provider message such as "Please try again in 7.66s"
 * or "try again in 2m59.5s". Returns milliseconds (with a small safety margin), or null.
 */
export function parseWaitMs(message: string): number | null {
  const found = /try again in\s+((?:\d+(?:\.\d+)?(?:ms|h|m|s))+)/i.exec(message);
  if (!found) return null;
  let total = 0;
  const part = /(\d+(?:\.\d+)?)(ms|h|m|s)/gi;
  let m: RegExpExecArray | null;
  while ((m = part.exec(found[1])) !== null) {
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    total += unit === "ms" ? n : unit === "s" ? n * 1000 : unit === "m" ? n * 60_000 : n * 3_600_000;
  }
  return Math.ceil(total) + 500;
}

function describeWait(ms: number): string {
  const mins = Math.ceil(ms / 60_000);
  return mins <= 1 ? "about a minute" : `about ${mins} minutes`;
}

export async function warmJobs(
  jobs: WarmJob[],
  questions: string[],
  deps: WarmDeps,
  opts: WarmOptions
): Promise<WarmSummary> {
  const summary: WarmSummary = { asked: 0, alreadyCached: 0, overridden: 0, failed: 0, stoppedBecause: null };

  // The same question is embedded once and reused for every job.
  const vectors = new Map<string, number[]>();
  const vectorFor = async (question: string): Promise<number[]> => {
    const known = vectors.get(question);
    if (known) return known;
    const fresh = await deps.embed(question);
    vectors.set(question, fresh);
    if (opts.embedDelayMs > 0) await deps.sleep(opts.embedDelayMs);
    return fresh;
  };

  let failuresInARow = 0;

  for (const job of jobs) {
    const before = { ...summary };

    for (const question of questions) {
      let tries = 0;
      for (;;) {
        try {
          const embedding = await vectorFor(question);
          if (await deps.hasOverride(job.id, embedding)) {
            summary.overridden++;
          } else if (await deps.hasCache(job.id, embedding)) {
            summary.alreadyCached++;
          } else {
            const answer = await deps.answer(job, question);
            await deps.store(job.id, question, embedding, answer);
            summary.asked++;
            if (opts.delayMs > 0) await deps.sleep(opts.delayMs);
          }
          failuresInARow = 0;
          break;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);

          if (isRateLimit(err)) {
            const wait = parseWaitMs(message) ?? 30_000;
            if (wait > opts.maxWaitMs || tries >= MAX_RATE_LIMIT_RETRIES) {
              summary.stoppedBecause =
                wait > opts.maxWaitMs
                  ? `The provider's limit is used up. Try again in ${describeWait(wait)}. Everything saved so far is kept.`
                  : "The provider kept refusing with a rate limit. Wait a few minutes and run it again. Everything saved so far is kept.";
              return summary;
            }
            tries++;
            deps.log(`  Rate limited. Waiting ${Math.ceil(wait / 1000)}s, then trying again.`);
            await deps.sleep(wait);
            continue;
          }

          summary.failed++;
          failuresInARow++;
          deps.log(`  Failed on "${question}": ${message.slice(0, 160)}`);
          if (failuresInARow >= MAX_FAILURES_IN_A_ROW) {
            summary.stoppedBecause = `${MAX_FAILURES_IN_A_ROW} failures in a row, so something is wrong. Check the messages above, then run it again.`;
            return summary;
          }
          break;
        }
      }
    }

    deps.log(
      `${job.label}: ${summary.asked - before.asked} new, ${summary.alreadyCached - before.alreadyCached} already saved, ` +
        `${summary.overridden - before.overridden} overridden, ${summary.failed - before.failed} failed`
    );
  }

  return summary;
}