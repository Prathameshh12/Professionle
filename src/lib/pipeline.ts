import { pool, toVectorLiteral } from "./db";
import { embed } from "./embeddings";
import { llm, type QuestionHistoryItem } from "./llm";
import { isGuessCorrect, type JobNames } from "./guessMatch";
import { isQuickQuestion } from "./quickQuestions";
import type { Answer, AskResult, GameSession, Job, ResolutionSource } from "@/types";

const NO_LIKE_ANSWERS: Answer[] = ["no", "not_really"];
const OVERRIDE_SIMILARITY_THRESHOLD = 0.92;
const CACHE_SIMILARITY_THRESHOLD = 0.9;
const MAX_NOS = 10;
const HISTORY_LIMIT = 30;

// ---------------------------------------------------------------------------
// Step 1: guess detection
// ---------------------------------------------------------------------------

// Titles and synonyms of every job, loaded once and reused for a few minutes.
// Used to tell whether a short guess like "designer" points at only one job.
const JOB_NAMES_TTL_MS = 10 * 60 * 1000;
let jobNamesCache: { at: number; rows: JobNames[] } | null = null;

async function loadJobNames(): Promise<JobNames[]> {
  if (jobNamesCache && Date.now() - jobNamesCache.at < JOB_NAMES_TTL_MS) return jobNamesCache.rows;
  const { rows } = await pool.query(`select id, title, synonyms from jobs`);
  const list: JobNames[] = rows.map((r: any) => ({
    id: String(r.id),
    names: [r.title, ...(r.synonyms ?? [])],
  }));
  jobNamesCache = { at: Date.now(), rows: list };
  return list;
}

async function isMatchForJob(guessedJob: string, job: Job): Promise<boolean> {
  const current: JobNames = { id: String(job.id), names: [job.title, ...job.synonyms] };
  let all: JobNames[] = [];
  try {
    all = await loadJobNames();
  } catch {
    // If the job list can't be loaded, fall back to this job's own names only.
  }
  return isGuessCorrect(guessedJob, current, all);
}

// Messages starting with these verbs are almost always attribute questions
// ("does it pay well?", "do you wear a uniform?"), never a job guess -
// skip the LLM classifier entirely for these.
const ATTRIBUTE_LEAD = /^(do|does|did|can|could|would|will|has|have|should)\b/i;

// Messages that plausibly name a job ("is it a vet?", "are you a chef",
// "my guess is baker") are ambiguous against attribute questions phrased the
// same way ("is it dangerous?") - only these go to the LLM classifier.
const GUESS_CANDIDATE = /^(is it|is this|is that|are you|is your job|is the job|my guess is|i think it'?s|i guess it'?s|could it be)\b/i;

// Words that start a question or a chat reply, never a job title.
const NOT_A_JOB_NAME =
  /^(what|why|how|where|when|which|who|whose|is|are|am|was|were|do|does|did|can|could|would|will|has|have|should|yes|no|maybe|hello|hi|hey|thanks|thank|help|hint|ok|okay)\b/i;

/** "pilot", "a pilot", "The Pilot?" all become "pilot". Returns null if it does not look like a bare job name. */
function bareJobName(question: string): string | null {
  const cleaned = question.trim().replace(/[?!.\s]+$/, "");
  if (!cleaned || cleaned.length > 40) return null;
  if (!/^[a-z][a-z'&\- ]*$/i.test(cleaned)) return null;
  if (NOT_A_JOB_NAME.test(cleaned)) return null;
  const name = cleaned.replace(/^(an?|the)\s+/i, "").trim().toLowerCase();
  if (name.length < 2 || name.split(/\s+/).length > 4) return null;
  return name;
}

async function detectGuess(question: string, job: Job): Promise<string | null> {
  const q = question.trim();
  if (!q) return null;

  
  // The one-tap chips are fixed questions and never guesses, so skip the AI check for them.
  if (isQuickQuestion(q)) return null;

  // Just a job name, like "pilot" or "a dentist".
  const bare = bareJobName(q);
  if (bare) {
    // The right answer is recognised locally, so it wins without an AI call.
    if (await isMatchForJob(bare, job)) return bare;
    // Anything else could be a wrong guess ("plumber") or a short question ("outdoors"). Ask the classifier.
    try {
      const result = await llm.classifyGuess(q);
      return result.is_guess ? result.guessed_job : null;
    } catch {
      return null; // if the check fails, treat it as a normal question instead of showing an error
    }
  }

  if (ATTRIBUTE_LEAD.test(q) || !GUESS_CANDIDATE.test(q)) return null;
  const result = await llm.classifyGuess(q);
  return result.is_guess ? result.guessed_job : null;
}

// ---------------------------------------------------------------------------
// Step 2: tag / category shortcut
// ---------------------------------------------------------------------------

const FIELD_TRIGGERS = ["field", "industry", "sector", "category", "domain", "area"];
const FIELD_PHRASING = /\b(is it|is this|is that|does it|is the job)\b.*\b(in|part of|related to|involve|involves|within)\b/i;

/** True if `word` appears in `text` as a whole word (an optional plural "s" is allowed), so "art" no longer matches "start". */
function containsWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}s?($|[^a-z0-9])`).test(text);
}

function checkTagShortcut(question: string, tags: string[]): Answer | null {
  const q = question.toLowerCase();
  const looksLikeFieldQuestion =
    FIELD_PHRASING.test(q) || FIELD_TRIGGERS.some((t) => q.includes(t));
  if (!looksLikeFieldQuestion) return null;

  for (const tag of tags) {
    const t = tag.toLowerCase();
    const singular = t.endsWith("s") ? t.slice(0, -1) : t;
    if (containsWord(q, t) || containsWord(q, singular)) return "yes";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Steps 3-4: overrides and cache (both via pgvector cosine similarity)
// ---------------------------------------------------------------------------

async function findOverride(jobId: string, embedding: number[]): Promise<Answer | null> {
  const { rows } = await pool.query(
    `select forced_answer, 1 - (question_embedding <=> $1::vector) as sim
     from answer_overrides
     where job_id = $2
     order by question_embedding <=> $1::vector
     limit 1`,
    [toVectorLiteral(embedding), jobId]
  );
  const row = rows[0];
  return row && row.sim >= OVERRIDE_SIMILARITY_THRESHOLD ? (row.forced_answer as Answer) : null;
}

async function findCacheHit(jobId: string, embedding: number[]): Promise<{ id: string; answer: Answer } | null> {
  const { rows } = await pool.query(
    `select id, canonical_answer, 1 - (question_embedding <=> $1::vector) as sim
     from question_cache
     where job_id = $2
     order by question_embedding <=> $1::vector
     limit 1`,
    [toVectorLiteral(embedding), jobId]
  );
  const row = rows[0];
  if (!row || row.sim < CACHE_SIMILARITY_THRESHOLD) return null;
  await pool.query(
    `update question_cache set hit_count = hit_count + 1, last_used_at = now() where id = $1`,
    [row.id]
  );
  return { id: row.id, answer: row.canonical_answer as Answer };
}

async function cacheLlmAnswer(jobId: string, question: string, embedding: number[], answer: Answer) {
  await pool.query(
    `insert into question_cache (job_id, question_text, question_embedding, canonical_answer, source)
     values ($1, $2, $3::vector, $4, 'llm')`,
    [jobId, question, toVectorLiteral(embedding), answer]
  );
}

// ---------------------------------------------------------------------------
// Step 5 support: recent question history for LLM consistency
// ---------------------------------------------------------------------------

async function recentHistory(sessionId: string): Promise<QuestionHistoryItem[]> {
  const { rows } = await pool.query(
    `select question_text, resolved_answer from question_log
     where session_id = $1 and was_guess_attempt = false
     order by created_at asc
     limit $2`,
    [sessionId, HISTORY_LIMIT]
  );
  return rows.map((r) => ({ question: r.question_text, answer: r.resolved_answer as Answer }));
}

// ---------------------------------------------------------------------------
// Step 6: logging + session state update
// ---------------------------------------------------------------------------

async function logQuestion(
  sessionId: string,
  question: string,
  answer: Answer,
  wasGuess: boolean,
  source: ResolutionSource
) {
  await pool.query(
    `insert into question_log (session_id, question_text, resolved_answer, was_guess_attempt, source)
     values ($1, $2, $3, $4, $5)`,
    [sessionId, question, answer, wasGuess, source]
  );
}

async function finalizeAnswer(
  session: GameSession,
  job: Job,
  question: string,
  answer: Answer,
  source: ResolutionSource
): Promise<AskResult> {
  await logQuestion(session.id, question, answer, false, source);

  const totalQuestions = session.total_questions + 1;
  let noCount = session.no_count;
  if (NO_LIKE_ANSWERS.includes(answer)) noCount += 1;

  const hintsRevealed = [...session.hints_revealed];
  let hint: string | undefined;
  let status = session.status;

  if (noCount >= 5 && !hintsRevealed.includes(5)) {
    hintsRevealed.push(5);
    hint = job.hint_1;
  }
  if (noCount >= 8 && !hintsRevealed.includes(8)) {
    hintsRevealed.push(8);
    hint = job.hint_2;
  }
  if (noCount >= MAX_NOS && status === "active") {
    status = "lost";
  }

  await pool.query(
    `update game_sessions
     set no_count = $1, total_questions = $2, hints_revealed = $3, status = $4,
         ended_at = case when $4 <> 'active' then now() else ended_at end
     where id = $5`,
    [noCount, totalQuestions, hintsRevealed, status, session.id]
  );

  return {
    answer,
    no_count: noCount,
    total_questions: totalQuestions,
    status,
    hint,
    revealed_title: status === "lost" ? job.title : undefined,
  };
}

async function finalizeWin(session: GameSession, job: Job, question: string): Promise<AskResult> {
  await logQuestion(session.id, question, "yes", true, "guess");
  const totalQuestions = session.total_questions + 1;
  await pool.query(
    `update game_sessions set total_questions = $1, status = 'won', ended_at = now() where id = $2`,
    [totalQuestions, session.id]
  );
  return {
    answer: null,
    no_count: session.no_count,
    total_questions: totalQuestions,
    status: "won",
    is_correct_guess: true,
    revealed_title: job.title,
  };
}

async function finalizeWrongGuess(session: GameSession, question: string): Promise<AskResult> {
  await logQuestion(session.id, question, "no", true, "guess");
  const totalQuestions = session.total_questions + 1;
  await pool.query(`update game_sessions set total_questions = $1 where id = $2`, [
    totalQuestions,
    session.id,
  ]);
  return {
    answer: null,
    no_count: session.no_count,
    total_questions: totalQuestions,
    status: "active",
    wrong_guess: true,
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function resolveQuestion(session: GameSession, job: Job, questionRaw: string): Promise<AskResult> {
  const question = questionRaw.trim();
  if (!question) throw new Error("Question text is required");
  if (session.status !== "active") throw new Error("This session has already ended");

  // Step 1: is this a direct guess at the job title?
  const guessedJob = await detectGuess(question, job);
  if (guessedJob) {
    return (await isMatchForJob(guessedJob, job))
      ? finalizeWin(session, job, question)
      : finalizeWrongGuess(session, question);
  }

  // Step 2: tag/category shortcut — instant, no embedding needed
  let answer: Answer | null = checkTagShortcut(question, job.tags);
  let source: ResolutionSource = "tag";

  // Steps 3-4 need an embedding; compute it once and reuse
  let embedding: number[] | null = null;
  if (!answer) {
    embedding = await embed(question);
    answer = await findOverride(job.id, embedding);
    source = "override";
  }
  if (!answer && embedding) {
    const hit = await findCacheHit(job.id, embedding);
    if (hit) {
      answer = hit.answer;
      source = "cache";
    }
  }

  // Step 5: LLM fallback, then cache the result for next time
  if (!answer) {
    const history = await recentHistory(session.id);
    answer = await llm.answerQuestion({
      profileProse: job.profile_prose,
      tags: job.tags,
      history,
      question,
    });
    source = "llm";
    if (!embedding) embedding = await embed(question);
    await cacheLlmAnswer(job.id, question, embedding, answer);
  }

  // Step 6
  return finalizeAnswer(session, job, question, answer, source);
}
