/* Shared helpers for scripts/generate-jobs.ts and scripts/seed-generated.ts.
 * Nothing in here is imported by the game itself, so it cannot affect gameplay. */
import type { Answer, Difficulty } from "../src/types";
import { CREATOR_TAG } from "../src/lib/constants";

// ---------------------------------------------------------------------------
// The question list every generated job answers up front. These match the
// questions your hand-written jobs already pre-answer, plus "own business".
// Answers are cached in the database, so common questions never need the AI.
// ---------------------------------------------------------------------------
export const FAQ_QUESTIONS: string[] = [
  "Do you work indoors?",
  "Do you work outdoors?",
  "Is it mostly desk work?",
  "Is it a hands-on job?",
  "Do you need a university degree?",
  "Do you need a special license or certification?",
  "Is it a creative job?",
  "Is it a conventional job?",
  "Is it dangerous?",
  "Is it physically demanding?",
  "Do you work with the public or clients?",
  "Do you usually work alone?",
  "Do you work as part of a team?",
  "Is it well paid?",
  "Do you wear a uniform?",
  "Does the job involve travel?",
  "Does it involve science?",
  "Does it involve technology?",
  "Do you work with animals?",
  "Do you work with children?",
  "Are you employed by someone else?",
  "Is it in the entertainment industry?",
  "Do you work regular business hours?",
  "Is it a job most people have heard of?",
  "Is it a job kids commonly dream of doing?",
  "Do you own your own business?",
];

// Short labels, same order as FAQ_QUESTIONS, used only in the review file.
export const FAQ_LABELS: string[] = [
  "indoors", "outdoors", "desk", "hands-on", "degree", "licence", "creative", "conventional",
  "dangerous", "physical", "public", "alone", "team", "well paid", "uniform", "travel", "science",
  "tech", "animals", "children", "employed", "entertainment", "9-to-5", "well known", "kid dream",
  "own business",
];

export type FaqAnswer = Exclude<Answer, "irrelevant">;
const FAQ_ANSWER_SET: FaqAnswer[] = ["yes", "no", "sometimes", "not_really"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export interface GeneratedJob {
  title: string;
  synonyms: string[];
  difficulty: Difficulty;
  tags: string[];
  profile_prose: string;
  hint_1: string;
  hint_2: string;
  faq: { question: string; answer: FaqAnswer }[];
  approved: boolean;
  generatedAt: string;
  model: string;
}

export const DEFAULT_MODEL = "openai/gpt-oss-120b";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Title matching. These mirror src/lib/pipeline.ts (normalize, trigram
// similarity, 0.6 threshold) so we can predict which titles the game would
// treat as the same. If you ever change that file, change these to match.
// ---------------------------------------------------------------------------
export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s}  `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) grams.add(padded.slice(i, i + 3));
  return grams;
}

export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const ta = trigrams(na);
  const tb = trigrams(nb);
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const g of ta) if (tb.has(g)) overlap++;
  return (2 * overlap) / (ta.size + tb.size);
}

/** True when the game would treat a guess of `a` as matching a job called `b`. */
export function titlesConflict(a: string, b: string): boolean {
  return similarity(a, b) >= 0.6;
}

export function findConflict(candidate: string, others: string[]): string | null {
  for (const other of others) {
    if (titlesConflict(candidate, other)) return other;
  }
  return null;
}

export function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

/** Collapses whitespace and swaps em/en dashes for commas. */
export function tidyText(s: string): string {
  return s.replace(/\s*[\u2014\u2013]\s*/g, ", ").replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Spoiler check: hints are shown to players, so they must not give away the job.
// ---------------------------------------------------------------------------
const GENERIC_TITLE_WORDS = new Set([
  "professional", "senior", "junior", "assistant", "general", "chief", "head", "specialist",
  "and", "the", "for", "of",
]);

export function leaksTitle(text: string, title: string, synonyms: string[]): string | null {
  const t = normalize(text);
  const padded = ` ${t} `;
  const words = t.split(/\s+/).filter(Boolean);

  for (const phrase of [title, ...synonyms]) {
    const np = normalize(phrase);
    if (np.length >= 4 && padded.includes(` ${np} `)) return phrase;
  }

  for (const w of normalize(title).split(/\s+/)) {
    if (w.length < 3 || GENERIC_TITLE_WORDS.has(w)) continue;
    if (w.length <= 4) {
      if (words.some((x) => x === w || x === `${w}s`)) return w;
    } else {
      const stem = w.length >= 6 ? w.slice(0, 5) : w.slice(0, 4);
      if (words.some((x) => x.startsWith(stem))) return w;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tags. The game answers YES instantly to "is it in <tag>" questions, so a
// wrong or vague tag gives a wrong answer with no AI check. Keep them tight.
// ---------------------------------------------------------------------------
const TAG_STOPLIST = new Set([
  "work", "job", "jobs", "career", "field", "industry", "sector", "category", "domain", "area",
  "general", "other", "people", "service", "services", "professional", "professionals", "skilled",
  "trade", "trades", "role", "roles", "business",
]);

export function cleanTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const out: string[] = [];
  for (const t of tags) {
    if (typeof t !== "string") continue;
    const tag = t.trim().toLowerCase().replace(/\s+/g, " ");
    if (tag.length < 4 || tag.length > 30) continue;
    if (TAG_STOPLIST.has(tag) || tag === CREATOR_TAG) continue;
    if (!/^[a-z][a-z \-]*$/.test(tag)) continue;
    if (!out.includes(tag)) out.push(tag);
  }
  return out.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Validation of one generated job.
// ---------------------------------------------------------------------------
export type ValidJob = Omit<GeneratedJob, "approved" | "generatedAt" | "model">;
export type ValidationResult = { ok: true; job: ValidJob } | { ok: false; errors: string[] };

export function validateGenerated(raw: unknown, title: string, otherTitles: string[]): ValidationResult {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["Response was not a JSON object."] };
  const r = raw as Record<string, unknown>;

  const difficulty = typeof r.difficulty === "string" ? r.difficulty.trim().toLowerCase() : "";
  if (!DIFFICULTIES.includes(difficulty as Difficulty)) errors.push('"difficulty" must be easy, medium or hard.');

  const synonyms: string[] = [];
  if (Array.isArray(r.synonyms)) {
    for (const s of r.synonyms) {
      if (typeof s !== "string") continue;
      const syn = s.trim().replace(/\s+/g, " ");
      if (syn.length < 3 || syn.length > 40) continue;
      if (normalize(syn) === normalize(title)) continue;
      if (findConflict(syn, otherTitles)) continue; // would collide with another job's title
      if (!synonyms.some((x) => normalize(x) === normalize(syn))) synonyms.push(syn);
    }
  }

  const tags = cleanTags(r.tags);
  if (tags.length < 3) errors.push('"tags" needs at least 3 specific category labels (4 or more letters each).');

  let profile = typeof r.profile_prose === "string" ? r.profile_prose : "";
  if (/^\s*([-*#\u2022]|\d+\.)\s/m.test(profile) || profile.includes("**")) {
    errors.push('"profile_prose" must be plain paragraph text with no lists, headings or markdown.');
  }
  profile = tidyText(profile);
  const words = wordCount(profile);
  if (words < 200 || words > 450) errors.push(`"profile_prose" is ${words} words, it must be 260 to 340.`);

  const hint1 = tidyText(typeof r.hint_1 === "string" ? r.hint_1 : "");
  const hint2 = tidyText(typeof r.hint_2 === "string" ? r.hint_2 : "");
  for (const [name, hint] of [["hint_1", hint1], ["hint_2", hint2]] as const) {
    const n = wordCount(hint);
    if (n < 6 || n > 40) errors.push(`"${name}" is ${n} words, it must be 10 to 25.`);
    const leak = leaksTitle(hint, title, synonyms);
    if (leak) errors.push(`"${name}" gives away the job by using "${leak}". Rewrite it without that word.`);
  }
  if (hint1 && hint1 === hint2) errors.push("hint_1 and hint_2 must be different.");

  const faq: ValidJob["faq"] = [];
  const answers = r.faq_answers && typeof r.faq_answers === "object" ? (r.faq_answers as Record<string, unknown>) : null;
  if (!answers) {
    errors.push('"faq_answers" must be an object with keys "1" to "' + FAQ_QUESTIONS.length + '".');
  } else {
    const bad: number[] = [];
    FAQ_QUESTIONS.forEach((question, i) => {
      const v = answers[String(i + 1)];
      const a = typeof v === "string" ? v.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";
      if (FAQ_ANSWER_SET.includes(a as FaqAnswer)) faq.push({ question, answer: a as FaqAnswer });
      else bad.push(i + 1);
    });
    if (bad.length) errors.push(`faq_answers missing or invalid for question number(s): ${bad.join(", ")}.`);
    else if (faq[0].answer === "yes" && faq[1].answer === "yes") {
      errors.push('A job cannot be "yes" for both indoors and outdoors. Use "sometimes" for one of them.');
    }
  }

  if (errors.length) return { ok: false, errors: errors.slice(0, 6) };
  return {
    ok: true,
    job: {
      title,
      synonyms: synonyms.slice(0, 5),
      difficulty: difficulty as Difficulty,
      tags,
      profile_prose: profile,
      hint_1: hint1,
      hint_2: hint2,
      faq,
    },
  };
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
export function buildJobPrompt(title: string, commonTags: string[], previousErrors: string[]): string {
  const questions = FAQ_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const retryBlock = previousErrors.length
    ? `\nYOUR PREVIOUS ATTEMPT WAS REJECTED. Fix these problems this time:\n${previousErrors.map((e) => `- ${e}`).join("\n")}\n`
    : "";

  return `You are writing one entry for a yes/no job-guessing game. Players ask yes/no questions to work out a hidden job. A separate AI later answers every player question using ONLY the profile you write here, so the profile must be accurate, specific, and cover what a curious guesser might ask.

JOB TITLE: ${title}

Describe the typical person in this job in an English-speaking developed country such as Australia.
${retryBlock}
Return strict JSON only (no markdown, no commentary) with exactly these keys:
{
  "synonyms": ["..."],
  "difficulty": "easy" | "medium" | "hard",
  "tags": ["..."],
  "profile_prose": "...",
  "hint_1": "...",
  "hint_2": "...",
  "faq_answers": { "1": "yes", "2": "no", "3": "sometimes", ... "${FAQ_QUESTIONS.length}": "not_really" }
}

RULES
synonyms: 2 to 5 other names for this exact same job. Not broader jobs, not narrower jobs, not a general field. Example: for "Dentist" use "dental practitioner", never "doctor".
difficulty: easy = almost everyone knows this job and what it involves. medium = well known but takes several good questions to pin down. hard = specialist, or easily confused with similar jobs.
tags: 3 to 5 lowercase category labels, 1 to 3 words each. The game answers YES instantly to "is it in <tag>" style questions, so only use tags that are clearly and centrally true for this job. Prefer these existing tags when they fit: ${commonTags.join(", ")}.
profile_prose: one plain paragraph of 260 to 340 words. No lists, no headings, no markdown, no em dashes. Cover: what the person does day to day, industry and who employs them, indoor or outdoor work, desk or hands-on work, education and licensing needed, dealing with the public or clients, creative versus routine, usual hours, how well paid it is in general terms (no dollar figures), physical demands and danger, teamwork versus working alone, common misconceptions, and neighbouring jobs it is often confused with. State facts plainly.
hint_1: one sentence of 10 to 25 words giving a gentle clue about the job.
hint_2: one sentence of 10 to 25 words that is clearly more specific than hint_1.
Both hints are shown to the player, so they must NOT contain the job title, any synonym, or any word from the title, and must not use em dashes.
faq_answers: answer every numbered question below for the typical person in this job, using exactly one of "yes", "no", "sometimes", "not_really".
  yes = clearly true for most people in this job
  no = clearly false
  sometimes = genuinely varies by employer or specialisation (do not use it just to avoid deciding)
  not_really = mostly false with occasional exceptions
Make the answers consistent with your profile.

QUESTIONS
${questions}`;
}

export function buildTitlesPrompt(count: number, existingTitles: string[], commonTags: string[]): string {
  return `You are helping build a yes/no job-guessing game. List ${count} different job titles that could be added.

Requirements:
- Real, recognizable jobs that an ordinary adult could try to guess by asking yes/no questions.
- Spread them across many areas: trades, health, education, creative work, hospitality, public service, science, business, media, sport, transport, technology, nature and agriculture.
- Roughly 40% very well known, 40% moderately well known, 20% specialist.
- Singular job titles of 1 to 4 words. No abbreviations, no slashes, no numbers.
- Each job must be clearly different from the others and from the existing list below. Do not include a job that is a narrower or broader version of an existing one (for example, no "Pastry Chef" if "Professional Chef" exists, no "Accountant" if "Forensic Accountant" exists).
- Avoid jobs tied to politics, religion, or anything illegal or adult.

EXISTING JOBS (do not repeat or closely resemble): ${existingTitles.join("; ")}
Useful category tags already in use: ${commonTags.slice(0, 25).join(", ")}

Return strict JSON only: { "titles": ["...", "..."] }`;
}

// ---------------------------------------------------------------------------
// Groq client. Standalone on purpose (does not touch src/lib/llm).
// ---------------------------------------------------------------------------
export class GroqFatalError extends Error {
  kind: "limit" | "auth";
  constructor(kind: "limit" | "auth", message: string) {
    super(message);
    this.name = "GroqFatalError";
    this.kind = kind;
  }
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_WAIT_MS = 120_000; // anything longer is a daily limit, not a per-minute one

function parseWaitMs(retryAfter: string | null, bodyText: string): number {
  if (retryAfter && !Number.isNaN(Number(retryAfter))) return Number(retryAfter) * 1000;
  const mins = bodyText.match(/in (\d+)m(?:([\d.]+)s)?/);
  if (mins) return (Number(mins[1]) * 60 + Number(mins[2] ?? 0)) * 1000;
  const ms = bodyText.match(/in ([\d.]+)ms/);
  if (ms) return Number(ms[1]);
  const secs = bodyText.match(/in ([\d.]+)s/);
  if (secs) return Number(secs[1]) * 1000;
  return 15_000;
}

function stripFences(raw: string): string {
  return raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

export async function groqJson(
  prompt: string,
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<unknown> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new GroqFatalError("auth", "GROQ_API_KEY is not set. Add it to your .env file.");
  const model = process.env.GEN_MODEL || DEFAULT_MODEL;
  let sendReasoning = model.includes("gpt-oss");

  for (let attempt = 1; attempt <= 6; attempt++) {
    const body: Record<string, unknown> = {
      model,
      temperature: opts.temperature ?? 0.3,
      max_completion_tokens: opts.maxTokens ?? 4000,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    };
    if (sendReasoning) body.reasoning_effort = "low";

    let res: Response;
    try {
      res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
      });
    } catch {
      await sleep(2000 * attempt); // network blip
      continue;
    }

    if (res.status === 429) {
      const waitMs = parseWaitMs(res.headers.get("retry-after"), await res.text());
      if (waitMs > MAX_WAIT_MS) {
        throw new GroqFatalError(
          "limit",
          `Groq rate limit reached (it asks for about ${Math.round(waitMs / 60000)} min). Progress is saved. Run the same command again later.`
        );
      }
      console.log(`  Groq rate limit, waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs + 1000);
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      throw new GroqFatalError("auth", "Groq rejected the API key. Check GROQ_API_KEY in your .env file.");
    }
    if (res.status === 400 && sendReasoning) {
      const text = await res.text();
      if (text.includes("reasoning_effort")) {
        sendReasoning = false; // this model does not take that option, retry without it
        continue;
      }
      throw new Error(`Groq error 400: ${text}`);
    }
    if (res.status >= 500) {
      await sleep(2000 * attempt);
      continue;
    }
    if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty answer.");
    return JSON.parse(stripFences(content)); // a bad parse throws and the caller retries
  }
  throw new Error("Groq kept failing after several retries.");
}