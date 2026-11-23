/** Scoring and the spoiler-free share text for the daily puzzle. Pure functions, no browser or server code. */

/** One line in the on-screen transcript. Also what gets saved for the daily round. */
export type TranscriptEntry =
  | { kind: "qa"; question: string; answer: "yes" | "no" | "sometimes" | "not_really" | "irrelevant" }
  | { kind: "wrong_guess"; question: string }
  | { kind: "hint"; level: 5 | 8; text: string };

export const SITE_URL = "https://professionle.vercel.app";
export const MAX_SCORE = 100;
const MIN_WIN_SCORE = 10;
const COST_PER_EXTRA_QUESTION = 3;
const COST_PER_HINT = 8;
const SQUARES_PER_ROW = 10;

export function countHints(transcript: TranscriptEntry[]): number {
  return transcript.filter((e) => e.kind === "hint").length;
}

/**
 * A win starts at 100. Every question after the first costs 3 points and every hint costs 8.
 * A win is never worth less than 10. A loss scores 0.
 * Example: solved in 6 questions with 1 hint = 100 - 15 - 8 = 77.
 */
export function computeScore(won: boolean, totalQuestions: number, hintsTaken: number): number {
  if (!won) return 0;
  const questions = Math.max(1, Math.floor(totalQuestions));
  const hints = Math.max(0, Math.floor(hintsTaken));
  const raw = MAX_SCORE - COST_PER_EXTRA_QUESTION * (questions - 1) - COST_PER_HINT * hints;
  return Math.max(MIN_WIN_SCORE, Math.min(MAX_SCORE, raw));
}

/** The coloured square for one transcript line. Hints do not get a square. */
export function squareFor(entry: TranscriptEntry): string | null {
  if (entry.kind === "hint") return null;
  if (entry.kind === "wrong_guess") return "⬛";
  switch (entry.answer) {
    case "yes":
      return "🟩";
    case "no":
      return "🟥";
    case "sometimes":
      return "🟨";
    case "not_really":
      return "🟧";
    default:
      return "⬜";
  }
}

/**
 * The text a player shares. It shows how the round went and nothing about the job itself:
 *
 *   Professionle #42 · 6 questions
 *   🟩🟩🟥🟨🟥🟩 ✅
 *   Score 77 · https://professionle.vercel.app
 */
export function buildShareText(args: {
  number: number | null;
  transcript: TranscriptEntry[];
  won: boolean;
  totalQuestions: number;
  score: number;
}): string {
  const squares = args.transcript.map(squareFor).filter((s): s is string => s !== null);
  const count = squares.length || args.totalQuestions;
  const label = args.number ? `Professionle #${args.number}` : "Professionle";
  const header = `${label} · ${count} ${count === 1 ? "question" : "questions"}`;

  const rows: string[] = [];
  for (let i = 0; i < squares.length; i += SQUARES_PER_ROW) rows.push(squares.slice(i, i + SQUARES_PER_ROW).join(""));
  const mark = args.won ? "✅" : "❌";
  if (rows.length === 0) rows.push(mark);
  else rows[rows.length - 1] = `${rows[rows.length - 1]} ${mark}`;

  return [header, ...rows, `Score ${args.score} · ${SITE_URL}`].join("\n");
}