import type { Answer } from "@/types";
import { buildAnswerPrompt, buildGuessClassifierPrompt } from "./prompts";
import { isValidAnswer, stripJsonFences, type GuessClassification, type LlmProvider, type QuestionHistoryItem } from "./types";

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
    throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq API returned no content");
  return text;
}

async function chatWithRetry(prompt: string): Promise<string> {
  try {
    return await chat(prompt);
  } catch (err) {
    return await chat(prompt);
  }
}

export const groqProvider: LlmProvider = {
  async answerQuestion(args: {
    profileProse: string;
    tags: string[];
    history: QuestionHistoryItem[];
    question: string;
  }): Promise<Answer> {
    const prompt = buildAnswerPrompt(args);
    const raw = await chatWithRetry(prompt);
    const parsed = JSON.parse(stripJsonFences(raw));
    if (!isValidAnswer(parsed.answer)) {
      throw new Error(`Groq returned invalid answer value: ${JSON.stringify(parsed)}`);
    }
    return parsed.answer;
  },

  async classifyGuess(question: string): Promise<GuessClassification> {
    const prompt = buildGuessClassifierPrompt(question);
    const raw = await chatWithRetry(prompt);
    const parsed = JSON.parse(stripJsonFences(raw));
    return {
      is_guess: Boolean(parsed.is_guess),
      guessed_job: typeof parsed.guessed_job === "string" ? parsed.guessed_job : null,
    };
  },
};
