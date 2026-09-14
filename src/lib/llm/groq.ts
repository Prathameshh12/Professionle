import type { Answer } from "@/types";
import { buildAnswerPrompt, buildGuessClassifierPrompt, buildRoleReversalPrompt } from "./prompts";
import { LlmHttpError, withRetry } from "./retry";
import {
  isValidAnswer,
  isValidMoveType,
  stripJsonFences,
  type GuessClassification,
  type LlmProvider,
  type QuestionHistoryItem,
  type RoleReversalMove,
  type RoleReversalTurn,
} from "./types";

const GROQ_MODEL = "openai/gpt-oss-120b";
const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

function apiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return key;
}

async function chat(prompt: string): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    throw new LlmHttpError(res.status, `Groq API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq API returned no content");
  return text;
}

export const groqProvider: LlmProvider = {
  async answerQuestion(args: {
    profileProse: string;
    tags: string[];
    history: QuestionHistoryItem[];
    question: string;
  }): Promise<Answer> {
    return withRetry(async () => {
      const prompt = buildAnswerPrompt(args);
      const raw = await chat(prompt);
      const parsed = JSON.parse(stripJsonFences(raw));
      if (!isValidAnswer(parsed.answer)) {
        throw new Error(`Groq returned invalid answer value: ${JSON.stringify(parsed)}`);
      }
      return parsed.answer;
    });
  },

  async classifyGuess(question: string): Promise<GuessClassification> {
    return withRetry(async () => {
      const prompt = buildGuessClassifierPrompt(question);
      const raw = await chat(prompt);
      const parsed = JSON.parse(stripJsonFences(raw));
      return {
        is_guess: Boolean(parsed.is_guess),
        guessed_job: typeof parsed.guessed_job === "string" ? parsed.guessed_job : null,
      };
    });
  },

  async nextRoleReversalMove(history: RoleReversalTurn[], turnsRemaining: number): Promise<RoleReversalMove> {
    return withRetry(async () => {
      const prompt = buildRoleReversalPrompt(history, turnsRemaining);
      const raw = await chat(prompt);
      const parsed = JSON.parse(stripJsonFences(raw));
      if (!isValidMoveType(parsed.type) || typeof parsed.text !== "string" || !parsed.text.trim()) {
        throw new Error(`Groq returned an invalid role-reversal move: ${JSON.stringify(parsed)}`);
      }
      return { type: parsed.type, text: parsed.text.trim() };
    });
  },
};