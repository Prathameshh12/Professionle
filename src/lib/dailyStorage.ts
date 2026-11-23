import { computeScore, countHints, type TranscriptEntry } from "./dailyScore";

/**
 * Saves today's daily round in the browser so a refresh picks up where the player left off,
 * and keeps their stats. Everything here is defensive: private mode, a full disk, or edited
 * data can never crash the game. In the worst case the player simply starts fresh.
 *
 * Only ONE round is kept: the latest one. Yesterday's finished round is replaced when
 * today's starts. Its result already lives in the stats.
 */

export const STORAGE_KEY = "professionle:daily:v1";

export interface DailyRound {
  /** YYYY-MM-DD of the puzzle (Sydney time by default). */
  date: string;
  number: number;
  /** ISO time the next puzzle starts. */
  nextAt: string;
  sessionId: string;
  status: "active" | "won" | "lost";
  transcript: TranscriptEntry[];
  noCount: number;
  totalQuestions: number;
  revealedTitle: string | null;
  /** Set when the round ends. */
  score: number | null;
  /** True once this round has been added to the stats. Stops it being counted twice. */
  counted: boolean;
}

export interface DailyStats {
  played: number;
  wins: number;
  /** Days in a row won, up to and including the last win. */
  streak: number;
  best: number;
  lastWinDate: string | null;
  /** Total questions across all wins. Used for the average. */
  winQuestions: number;
}

export interface DailyData {
  v: 1;
  round: DailyRound | null;
  stats: DailyStats;
}

/** What the home screen needs to draw the Today's Case card. */
export interface DailyHome {
  phase: "new" | "resume" | "done";
  number: number | null;
  dateLabel: string | null;
  nextAt: string | null;
  status?: "won" | "lost";
  score?: number;
  noCount?: number;
  totalQuestions?: number;
  squares?: string[];
}

/** What /api/daily/today returns, in the shape the app uses. */
export interface TodayInfo {
  date: string;
  number: number;
  nextAt: string;
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function emptyStats(): DailyStats {
  return { played: 0, wins: 0, streak: 0, best: 0, lastWinDate: null, winQuestions: 0 };
}

export function emptyData(): DailyData {
  return { v: 1, round: null, stats: emptyStats() };
}

// ---------------------------------------------------------------------------
// Dates (plain calendar maths on YYYY-MM-DD, no time zones involved)
// ---------------------------------------------------------------------------
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const check = new Date(Date.UTC(y, mo - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === mo - 1 && check.getUTCDate() === d;
}

/** Adds (or subtracts) whole days to a YYYY-MM-DD date. */
export function shiftDate(date: string, days: number): string {
  const m = DATE_RE.exec(date);
  if (!m) throw new Error(`Invalid date "${date}"`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days)).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Reading saved data safely
// ---------------------------------------------------------------------------
const ANSWERS = ["yes", "no", "sometimes", "not_really", "irrelevant"] as const;

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function wholeNumber(x: unknown, min: number, max: number): number | null {
  return typeof x === "number" && Number.isInteger(x) && x >= min && x <= max ? x : null;
}

function cleanEntry(x: unknown): TranscriptEntry | null {
  if (!isRecord(x)) return null;
  if (x.kind === "qa" && typeof x.question === "string" && (ANSWERS as readonly unknown[]).includes(x.answer)) {
    return { kind: "qa", question: x.question, answer: x.answer as (typeof ANSWERS)[number] };
  }
  if (x.kind === "wrong_guess" && typeof x.question === "string") {
    return { kind: "wrong_guess", question: x.question };
  }
  if (x.kind === "hint" && (x.level === 5 || x.level === 8) && typeof x.text === "string") {
    return { kind: "hint", level: x.level, text: x.text };
  }
  return null;
}

function cleanRound(x: unknown): DailyRound | null {
  if (!isRecord(x)) return null;
  const number = wholeNumber(x.number, 1, 1_000_000);
  const noCount = wholeNumber(x.noCount, 0, 10);
  const totalQuestions = wholeNumber(x.totalQuestions, 0, 10_000);
  if (!isRealDate(x.date) || number === null || noCount === null || totalQuestions === null) return null;
  if (typeof x.nextAt !== "string" || Number.isNaN(Date.parse(x.nextAt))) return null;
  if (typeof x.sessionId !== "string" || x.sessionId === "") return null;
  if (x.status !== "active" && x.status !== "won" && x.status !== "lost") return null;
  if (!Array.isArray(x.transcript)) return null;

  const transcript = x.transcript.map(cleanEntry).filter((e): e is TranscriptEntry => e !== null);
  const score = wholeNumber(x.score, 0, 100);
  const finished = x.status !== "active";

  return {
    date: x.date,
    number,
    nextAt: x.nextAt,
    sessionId: x.sessionId,
    status: x.status,
    transcript: transcript.slice(0, 500),
    noCount,
    totalQuestions,
    revealedTitle: typeof x.revealedTitle === "string" ? x.revealedTitle : null,
    score: finished ? score ?? 0 : null,
    counted: finished ? x.counted === true : false,
  };
}

function cleanStats(x: unknown): DailyStats {
  if (!isRecord(x)) return emptyStats();
  const played = wholeNumber(x.played, 0, 1_000_000);
  const wins = wholeNumber(x.wins, 0, 1_000_000);
  const streak = wholeNumber(x.streak, 0, 1_000_000);
  const best = wholeNumber(x.best, 0, 1_000_000);
  const winQuestions = wholeNumber(x.winQuestions, 0, 100_000_000);
  if (played === null || wins === null || streak === null || best === null || winQuestions === null) return emptyStats();
  if (wins > played) return emptyStats();
  return {
    played,
    wins,
    streak,
    best: Math.max(best, streak),
    lastWinDate: isRealDate(x.lastWinDate) ? x.lastWinDate : null,
    winQuestions,
  };
}

/** Turns saved text into data. Never throws: anything unreadable becomes a clean empty state. */
export function parseDaily(raw: string | null): DailyData {
  if (!raw) return emptyData();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.v !== 1) return emptyData();
    return { v: 1, round: cleanRound(parsed.round), stats: cleanStats(parsed.stats) };
  } catch {
    return emptyData();
  }
}

function browserStore(): KeyValueStore | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null; // some browsers throw just for touching localStorage
  }
}

export function loadDaily(store: KeyValueStore | null = browserStore()): DailyData {
  if (!store) return emptyData();
  try {
    return parseDaily(store.getItem(STORAGE_KEY));
  } catch {
    return emptyData();
  }
}

/** Returns false if it could not save (private mode, storage full). The game carries on either way. */
export function saveDaily(data: DailyData, store: KeyValueStore | null = browserStore()): boolean {
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Changing the data. Each function returns a new object and leaves the old one alone.
// ---------------------------------------------------------------------------

/** Is this saved round the puzzle that is live right now? */
export function roundIsToday(round: DailyRound, today: TodayInfo | null, nowMs: number): boolean {
  if (today) return round.date === today.date;
  const next = Date.parse(round.nextAt);
  return !Number.isNaN(next) && nowMs < next;
}

export function startRound(
  data: DailyData,
  init: { date: string; number: number; nextAt: string; sessionId: string }
): DailyData {
  const round: DailyRound = {
    date: init.date,
    number: init.number,
    nextAt: init.nextAt,
    sessionId: init.sessionId,
    status: "active",
    transcript: [],
    noCount: 0,
    totalQuestions: 0,
    revealedTitle: null,
    score: null,
    counted: false,
  };
  return { ...data, round };
}

/** Saves progress in an active round. Does nothing if there is no active round. */
export function updateRound(
  data: DailyData,
  patch: { transcript: TranscriptEntry[]; noCount: number; totalQuestions: number }
): DailyData {
  if (!data.round || data.round.status !== "active") return data;
  return {
    ...data,
    round: { ...data.round, transcript: patch.transcript, noCount: patch.noCount, totalQuestions: patch.totalQuestions },
  };
}

/**
 * Ends the round and adds it to the stats. Safe to call twice: the second call changes nothing,
 * so a round can never be counted twice.
 */
export function finishRound(
  data: DailyData,
  end: {
    status: "won" | "lost";
    transcript: TranscriptEntry[];
    noCount: number;
    totalQuestions: number;
    revealedTitle: string | null;
  }
): DailyData {
  const round = data.round;
  if (!round || round.counted) return data;

  const won = end.status === "won";
  const score = computeScore(won, end.totalQuestions, countHints(end.transcript));

  const stats = { ...data.stats };
  stats.played += 1;
  if (won) {
    stats.wins += 1;
    stats.winQuestions += end.totalQuestions;
    if (stats.lastWinDate !== round.date) {
      stats.streak = stats.lastWinDate === shiftDate(round.date, -1) ? stats.streak + 1 : 1;
    }
    stats.lastWinDate = round.date;
    stats.best = Math.max(stats.best, stats.streak);
  } else {
    stats.streak = 0;
  }

  return {
    ...data,
    stats,
    round: {
      ...round,
      status: end.status,
      transcript: end.transcript,
      noCount: end.noCount,
      totalQuestions: end.totalQuestions,
      revealedTitle: end.revealedTitle ?? round.revealedTitle,
      score,
      counted: true,
    },
  };
}

/** Average questions per win, to one decimal place. Null until the first win. */
export function averageQuestions(stats: DailyStats): number | null {
  if (stats.wins === 0) return null;
  return Math.round((stats.winQuestions / stats.wins) * 10) / 10;
}

/** Works out what the home screen's Today's Case card should say. */
export function buildDailyHome(
  data: DailyData,
  today: TodayInfo | null,
  nowMs: number,
  formatDate: (date: string) => string
): DailyHome {
  const round = data.round && roundIsToday(data.round, today, nowMs) ? data.round : null;
  const number = round?.number ?? today?.number ?? null;
  const date = round?.date ?? today?.date ?? null;
  const nextAt = round?.nextAt ?? today?.nextAt ?? null;
  const base = { number, dateLabel: date ? formatDate(date) : null, nextAt };

  if (!round) return { phase: "new", ...base };
  if (round.status === "active") {
    return { phase: "resume", ...base, noCount: round.noCount, totalQuestions: round.totalQuestions };
  }
  return {
    phase: "done",
    ...base,
    status: round.status,
    score: round.score ?? 0,
    noCount: round.noCount,
    totalQuestions: round.totalQuestions,
    squares: squaresFor(round.transcript),
  };
}

const SQUARE_CODE: Record<string, string> = { yes: "g", no: "r", sometimes: "y", not_really: "o", irrelevant: "w" };

/** Colour codes for the finished-round row on the home screen. Hints do not get one. */
function squaresFor(transcript: TranscriptEntry[]): string[] {
  const out: string[] = [];
  for (const entry of transcript) {
    if (entry.kind === "wrong_guess") out.push("k");
    else if (entry.kind === "qa") out.push(SQUARE_CODE[entry.answer] ?? "w");
  }
  return out;
}