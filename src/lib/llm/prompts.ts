import type { QuestionHistoryItem } from "./types";

export function buildAnswerPrompt(args: {
  profileProse: string;
  tags: string[];
  history: QuestionHistoryItem[];
  question: string;
}): string {
  const { profileProse, tags, history, question } = args;
  const historyBlock =
    history.length === 0
      ? "(no questions asked yet)"
      : history.map((h) => `Q: "${h.question}" -> ${h.answer}`).join("\n");

  return `You are answering yes/no questions about a specific job in a guessing game. Answer the way
someone who genuinely knows this job inside out would, including judgment calls on subjective
or creative framing, not just hard facts.

JOB PROFILE (this is the ONLY source of truth, do not use outside knowledge):
${profileProse}

JOB CATEGORY TAGS: ${tags.join(", ")}

CONVERSATION SO FAR (for consistency, do not contradict earlier answers):
${historyBlock}

NEW QUESTION: "${question}"

Respond with strict JSON only, no other text, no markdown fences:
{"answer": "yes" | "no" | "sometimes" | "not_really" | "irrelevant"}

Use "irrelevant" only if the question has nothing to do with a job at all (e.g. small talk).
Use "sometimes" for genuinely mixed cases per the profile, not as a hedge to avoid deciding.`;
}

export function buildGuessClassifierPrompt(question: string): string {
  return `A player in a job-guessing game just typed the following message. Decide whether they
are directly guessing a specific job title (e.g. "is it a dentist?", "are you an architect",
"electrician??") as opposed to asking a yes/no question about an attribute of the job
(e.g. "do you work outdoors?", "is it dangerous?").

MESSAGE: "${question}"

Respond with strict JSON only, no other text, no markdown fences:
{"is_guess": true | false, "guessed_job": string | null}

"guessed_job" should be the plain job title they guessed (e.g. "dentist"), or null if is_guess
is false.`;
}
