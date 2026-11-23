/**
 * Decides whether a typed guess counts as the right job.
 * Pure functions only (no database), so they are easy to test.
 */

export type JobNames = { id: string; names: string[] };

// Words that carry no meaning when comparing job names.
const NOISE_WORDS = new Set(["professional", "a", "an", "the"]);

function singular(word: string): string {
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

function nameWords(text: string): string[] {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w && !NOISE_WORDS.has(w))
    .map(singular);
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s}  `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) grams.add(padded.slice(i, i + 3));
  return grams;
}

/** Spelling closeness between two word lists of the same length (0 to 1). */
function spellingSimilarity(a: string[], b: string[]): number {
  const sa = a.join(" ");
  const sb = b.join(" ");
  if (sa === sb) return 1;
  const ta = trigrams(sa);
  const tb = trigrams(sb);
  let overlap = 0;
  for (const g of ta) if (tb.has(g)) overlap++;
  return (2 * overlap) / (ta.size + tb.size);
}

/**
 * How well a guess matches one job:
 *   3 = same name (or a small typo), e.g. "chef", "electritian"
 *   2 = the guess is more specific than a name, e.g. "head chef" for "chef"
 *   1 = the guess is the last word of a longer name, e.g. "trainer" for "personal trainer"
 *   0 = no match
 */
export function matchScore(guess: string, names: string[]): number {
  const g = nameWords(guess);
  if (g.length === 0) return 0;
  let best = 0;
  for (const name of names) {
    const n = nameWords(name);
    if (n.length === 0) continue;
    if (g.length === n.length && spellingSimilarity(g, n) >= 0.7) return 3;
    if (n.every((w) => g.includes(w))) best = Math.max(best, 2);
    else if (g.length < n.length && g.every((w) => n.includes(w)) && g.includes(n[n.length - 1])) {
      best = Math.max(best, 1);
    }
  }
  return best;
}

/**
 * True if the guess should win for the current job.
 * Exact names always win. A more specific guess wins unless another job has that exact name.
 * A short guess like "designer" only wins if it points to this job and no other job.
 */
export function isGuessCorrect(guess: string, current: JobNames, all: JobNames[]): boolean {
  const mine = matchScore(guess, current.names);
  if (mine === 0) return false;
  if (mine === 3) return true;
  const others = all.filter((j) => j.id !== current.id).map((j) => matchScore(guess, j.names));
  if (mine === 2) return !others.includes(3);
  return others.every((s) => s === 0);
}