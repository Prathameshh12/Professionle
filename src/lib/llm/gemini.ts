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

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

async function generate(prompt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    throw new LlmHttpError(res.status, `Gemini API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini API returned no text content");
  return text;
}

export const geminiProvider: LlmProvider = {
  async answerQuestion(args: {
    profileProse: string;
    tags: string[];
    history: QuestionHistoryItem[];
    question: string;
  }): Promise<Answer> {
    return withRetry(async () => {
      const prompt = buildAnswerPrompt(args);
      const raw = await generate(prompt);
      const parsed = JSON.parse(stripJsonFences(raw));
      if (!isValidAnswer(parsed.answer)) {
        throw new Error(`Gemini returned invalid answer value: ${JSON.stringify(parsed)}`);
      }
      return parsed.answer;
    });
  },

  async classifyGuess(question: string): Promise<GuessClassification> {
    return withRetry(async () => {
      const prompt = buildGuessClassifierPrompt(question);
      const raw = await generate(prompt);
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
      const raw = await generate(prompt);
      const parsed = JSON.parse(stripJsonFences(raw));
      if (!isValidMoveType(parsed.type) || typeof parsed.text !== "string" || !parsed.text.trim()) {
        throw new Error(`Gemini returned an invalid role-reversal move: ${JSON.stringify(parsed)}`);
      }
      return { type: parsed.type, text: parsed.text.trim() };
    });
  },
};

export async function geminiEmbed(text: string): Promise<number[]> {
  return withRetry(async () => {
    const res = await fetch(`${BASE_URL}/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${GEMINI_EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    });
    if (!res.ok) {
      throw new LlmHttpError(res.status, `Gemini embedding error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const values: number[] | undefined = data?.embedding?.values;
    if (!values) throw new Error("Gemini embedding API returned no values");
    return values;
  });
}