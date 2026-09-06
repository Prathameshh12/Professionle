import type { Answer } from "@/types";

export interface QuestionHistoryItem {
  question: string;
  answer: Answer;
}

export interface GuessClassification {
  is_guess: boolean;
  guessed_job: string | null;
}

/**
 * A swappable LLM backend. Anything implementing this interface can be
 * dropped into `src/lib/llm/index.ts` without touching game logic
 * (resolution pipeline, API routes, frontend all talk to this interface only).
 */
export interface LlmProvider {
  /** Yes/no-style judgement call for step 5 of the resolution pipeline. */
  answerQuestion(args: {
    profileProse: string;
    tags: string[];
    history: QuestionHistoryItem[];
    question: string;
  }): Promise<Answer>;

  /** Cheap classification: is this message actually a guess at the job title? */
  classifyGuess(question: string): Promise<GuessClassification>;
}

export const VALID_ANSWERS: Answer[] = ["yes", "no", "sometimes", "not_really", "irrelevant"];

export function isValidAnswer(value: unknown): value is Answer {
  return typeof value === "string" && (VALID_ANSWERS as string[]).includes(value);
}

/** Strips markdown code fences some models wrap JSON in, despite instructions not to. */
export function stripJsonFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}
