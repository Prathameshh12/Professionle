import type { QuestionHistoryItem, RoleReversalTurn } from "./types";

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

export function buildRoleReversalPrompt(history: RoleReversalTurn[], turnsRemaining: number): string {
  const historyBlock =
    history.length === 0
      ? "(nothing asked yet — this is your first move)"
      : history
          .map((turn) =>
            turn.kind === "qa"
              ? `Q: "${turn.question}" -> ${turn.answer}`
              : `GUESS: "${turn.guess}" -> wrong, not that job`
          )
          .join("\n");

  return `You are playing a reversed 20-questions game. A human is thinking of a real job they
actually do or know well. YOU are the guesser: ask sharp yes/no questions to narrow down what the
job is, then guess the specific job title once you have enough signal.

CONVERSATION SO FAR:
${historyBlock}

You have ${turnsRemaining} turn(s) left. Play like a skilled human 20-questions player, not a
random-question generator:
1. Re-read the whole conversation above before every move and actually update your working
   hypothesis — don't ask something the answers already rule out or already confirm.
2. Early on, ask broad questions that each roughly split the space of possible jobs in half
   (indoors vs outdoors, needs a degree vs doesn't, works mostly alone vs with people/clients,
   physical vs desk-based, technical vs creative vs caregiving vs manual, public/customer-facing
   vs behind-the-scenes, regulated/licensed profession vs not).
3. Once several answers converge on a category (e.g. "indoors, needs a degree, works with
   computers, works in a team"), stop asking generic category questions and start distinguishing
   between the specific real jobs that fit that profile so far.
4. Guess a specific real job title as soon as one or two candidates clearly fit best. Don't keep
   asking once you're genuinely narrowed down, but don't guess wildly either — a guess should
   follow logically from the answers above it, not be a shot in the dark.
5. Never repeat a question you've already asked, and never re-guess a job you've already been told
   is wrong — treat a wrong guess as new information that rules that job (and close variants of it)
   out.
6. As turns run low, be more willing to commit to your best guess rather than asking one more
   clarifying question.

First, in a "reasoning" field, briefly (1-3 short sentences) state what you've ruled in/out so far
and why your next move follows from that. This is for your own use, not shown to the player, so be
concrete and honest rather than vague. Then decide your actual move.

Respond with strict JSON only, no other text, no markdown fences:
{"reasoning": "...", "type": "question" | "guess", "text": "..."}

If "type" is "question", "text" must be a single, atomic yes/no question (never phrased with "or").
If "type" is "guess", "text" must be the plain job title you're guessing (e.g. "electrician"), not
a full sentence.`;
}