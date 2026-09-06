import { pool, toVectorLiteral } from "./db";
import { embed } from "./embeddings";
import { llm, type QuestionHistoryItem } from "./llm";
import type { Answer, AskResult, GameSession, Job, ResolutionSource } from "@/types";

const NO_LIKE_ANSWERS: Answer[] = ["no", "not_really"];
const OVERRIDE_SIMILARITY_THRESHOLD = 0.92;
const CACHE_SIMILARITY_THRESHOLD = 0.9;
const MAX_NOS = 10;
const HISTORY_LIMIT = 30;

// ---------------------------------------------------------------------------
// Step 1: guess detection
// ---------------------------------------------------------------------------

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s}  `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) grams.add(padded.slice(i, i + 3));
  return grams;
}

/** Cheap local string similarity (0-1), used for guess matching without an LLM/DB round trip. */
function similarity(a: string, b: string): number {
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

function isMatchForJob(guessedJob: string, job: Job): boolean {
  const candidates = [job.title, ...job.synonyms];
  return candidates.some((c) => similarity(c, guessedJob) >= 0.6);
}

// Messages starting with these verbs are almost always attribute questions
// ("does it pay well?", "do you wear a uniform?"), never a job guess -
// skip the LLM classifier entirely for these.
const ATTRIBUTE_LEAD = /^(do|does|did|can|could|would|will|has|have|should)\b/i;

// Messages that plausibly name a job ("is it a vet?", "are you a chef",
// "my guess is baker") are ambiguous against attribute questions phrased the
// same way ("is it dangerous?") - only these go to the LLM classifier.
const GUESS_CANDIDATE = /^(is it|is this|is that|are you|is your job|is the job|my guess is|i think it'?s|i guess it'?s|could it be)\b/i;

async function detectGuess(question: string): Promise<string | null> {
  const q = question.trim();
  if (!q || ATTRIBUTE_LEAD.test(q) || !GUESS_CANDIDATE.test(q)) return null;
  const result = await llm.classifyGuess(q);
  return result.is_guess ? result.guessed_job : null;
}

// ---------------------------------------------------------------------------
// Step 2: tag / category shortcut
// ---------------------------------------------------------------------------

const FIELD_TRIGGERS = ["field", "industry", "sector", "category", "domain", "area"];
const FIELD_PHRASING = /\b(is it|is this|is that|does it|is the job)\b.*\b(in|part of|related to|involve|involves|within)\b/i;

function checkTagShortcut(question: string, tags: string[]): Answer | null {
  const q = question.toLowerCase();
  const looksLikeFieldQuestion =
    FIELD_PHRASING.test(q) || FIELD_TRIGGERS.some((t) => q.includes(t));
  if (!looksLikeFieldQuestion) return null;

  for (const tag of tags) {
    const t = tag.toLowerCase();
    const singular = t.endsWith("s") ? t.slice(0, -1) : t;
    if (q.includes(t) || q.includes(singular)) return "yes";
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
  const guessedJob = await detectGuess(question);
  if (guessedJob) {
    return isMatchForJob(guessedJob, job)
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
