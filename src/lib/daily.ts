import { pool } from "./db";
import { CREATOR_TAG } from "./constants";

/**
 * Daily puzzle logic: which day is it, which job is today's, and what puzzle number is that.
 *
 * Settings (all optional environment variables):
 *   DAILY_TIMEZONE         default "Australia/Sydney". The puzzle changes at midnight in this zone.
 *   DAILY_EPOCH            default "2026-11-12". The date of puzzle #1. Set it to your launch day.
 *   DAILY_NO_REPEAT_DAYS   default 30. A job is not reused within this many days (before or after).
 */

/** Anything with a pg-style query method: the shared pool, a client, or a test database. */
export interface Queryable {
  query(text: string, params?: unknown[]): Promise<{ rows: any[] }>;
}

export interface DailyPuzzle {
  /** YYYY-MM-DD in the daily timezone. */
  date: string;
  jobId: string;
  number: number;
}

// ---------------------------------------------------------------------------
// Settings, with safe fallbacks so a typo in an env var can never break the game.
// ---------------------------------------------------------------------------
const DEFAULT_TIMEZONE = "Australia/Sydney";
const DEFAULT_EPOCH = "2026-11-12";
const DEFAULT_NO_REPEAT_DAYS = 30;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(dateStr: string): { y: number; m: number; d: number } {
  const match = DATE_RE.exec(dateStr);
  if (!match) throw new Error(`Invalid date "${dateStr}", expected YYYY-MM-DD`);
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    throw new Error(`Invalid date "${dateStr}"`);
  }
  return { y, m, d };
}

function resolveTimezone(value: string | undefined): string {
  if (!value) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value });
    return value;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function resolveEpoch(value: string | undefined): string {
  if (!value) return DEFAULT_EPOCH;
  try {
    parseDate(value);
    return value;
  } catch {
    return DEFAULT_EPOCH;
  }
}

function resolveNoRepeatDays(value: string | undefined): number {
  if (value === undefined || value.trim() === "") return DEFAULT_NO_REPEAT_DAYS;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 365 ? n : DEFAULT_NO_REPEAT_DAYS;
}

export const DAILY_TIMEZONE = resolveTimezone(process.env.DAILY_TIMEZONE);
export const DAILY_EPOCH = resolveEpoch(process.env.DAILY_EPOCH);
export const NO_REPEAT_DAYS = resolveNoRepeatDays(process.env.DAILY_NO_REPEAT_DAYS);

// A job needs at least this many pre-answered questions to be picked while better candidates exist.
const MIN_SEEDED_ANSWERS = 10;

// ---------------------------------------------------------------------------
// Dates and time zones (no libraries, just Intl)
// ---------------------------------------------------------------------------
function partsInZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const out: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) out[part.type] = part.value;
  return {
    y: Number(out.year),
    m: Number(out.month),
    d: Number(out.day),
    h: Number(out.hour),
    mi: Number(out.minute),
    s: Number(out.second),
  };
}

/** Milliseconds the zone is ahead of UTC at this instant (e.g. +11h in Sydney summer). */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const p = partsInZone(date, timeZone);
  const asIfUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
  return asIfUtc - Math.floor(date.getTime() / 1000) * 1000;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Today's date as YYYY-MM-DD in the daily timezone. */
export function todayInZone(now: Date = new Date(), timeZone: string = DAILY_TIMEZONE): string {
  const p = partsInZone(now, timeZone);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

/** Adds (or subtracts) whole days to a YYYY-MM-DD date. */
export function addDays(dateStr: string, days: number): string {
  const { y, m, d } = parseDate(dateStr);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** The exact moment a given calendar day begins (00:00) in the daily timezone. */
export function startOfDayInZone(dateStr: string, timeZone: string = DAILY_TIMEZONE): Date {
  const { y, m, d } = parseDate(dateStr);
  const localMidnightAsUtc = Date.UTC(y, m - 1, d);
  let t = localMidnightAsUtc;
  for (let i = 0; i < 3; i++) t = localMidnightAsUtc - zoneOffsetMs(new Date(t), timeZone);
  return new Date(t);
}

/** When the next puzzle starts, given today's date. Used for the countdown. */
export function nextPuzzleStart(dateStr: string, timeZone: string = DAILY_TIMEZONE): Date {
  return startOfDayInZone(addDays(dateStr, 1), timeZone);
}

/** Puzzle number for a date: the epoch day is #1. Never lower than 1. */
export function puzzleNumberFor(dateStr: string, epoch: string = DAILY_EPOCH): number {
  const a = parseDate(dateStr);
  const b = parseDate(epoch);
  const days = Math.round((Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d)) / 86_400_000);
  return Math.max(1, days + 1);
}

// ---------------------------------------------------------------------------
// Picking the job for a day
// ---------------------------------------------------------------------------
async function readPuzzle(date: string, db: Queryable): Promise<DailyPuzzle | null> {
  const { rows } = await db.query(
    `select puzzle_date::text as puzzle_date, job_id from daily_puzzles where puzzle_date = $1::date`,
    [date]
  );
  if (!rows[0]) return null;
  return { date: rows[0].puzzle_date, jobId: rows[0].job_id, number: puzzleNumberFor(rows[0].puzzle_date) };
}

/**
 * Chooses a job for `date`. In order of preference it picks a job that:
 *   1. has not been a daily puzzle within NO_REPEAT_DAYS either side of that date
 *   2. has its pre-answered questions loaded
 *   3. is chosen at random from whatever is left
 * If every job has been used recently (a very small pool), it takes the one used longest ago.
 * The creator profile is never eligible.
 */
async function pickJobId(date: string, db: Queryable): Promise<string | null> {
  const { rows } = await db.query(
    `select id from (
       select j.id,
              exists (
                select 1 from daily_puzzles p
                where p.job_id = j.id
                  and p.puzzle_date between $2::date - $3::int and $2::date + $3::int
              ) as recent,
              (select count(*) from question_cache q where q.job_id = j.id and q.source = 'seed') as seeded,
              (select max(p.puzzle_date) from daily_puzzles p where p.job_id = j.id) as last_used
       from jobs j
       where not ($1 = any(j.tags))
     ) t
     order by recent asc,
              (seeded < ${MIN_SEEDED_ANSWERS}) asc,
              case when recent then last_used end asc nulls first,
              random()
     limit 1`,
    [CREATOR_TAG, date, NO_REPEAT_DAYS]
  );
  return rows[0]?.id ?? null;
}

/**
 * Returns the puzzle for a date, creating it if it does not exist yet.
 * Safe to call from many requests at once: the insert does nothing if another request
 * got there first, and everyone then reads the same row.
 */
export async function getOrCreatePuzzle(date: string, db: Queryable = pool): Promise<DailyPuzzle> {
  parseDate(date); // throws on a malformed date before touching the database

  const existing = await readPuzzle(date, db);
  if (existing) return existing;

  const jobId = await pickJobId(date, db);
  if (!jobId) throw new Error("No jobs available for the daily puzzle. Run `npm run seed` first.");

  await db.query(
    `insert into daily_puzzles (puzzle_date, job_id) values ($1::date, $2) on conflict (puzzle_date) do nothing`,
    [date, jobId]
  );

  const created = await readPuzzle(date, db);
  if (!created) throw new Error("Could not create today's daily puzzle.");
  return created;
}

/** Today's puzzle (today in the daily timezone). */
export async function getTodaysPuzzle(db: Queryable = pool, now: Date = new Date()): Promise<DailyPuzzle> {
  return getOrCreatePuzzle(todayInZone(now), db);
}