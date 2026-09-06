import { geminiProvider } from "./gemini";
import { groqProvider } from "./groq";
import type { LlmProvider } from "./types";

/**
 * The one place that decides which LLM backend answers game questions.
 * Set LLM_PROVIDER=gemini|groq in the environment. To add a new backend
 * (e.g. Claude, GPT), implement LlmProvider in a new file and add a branch
 * here — no other file in the app needs to change.
 */
function selectProvider(): LlmProvider {
  const provider = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();
  switch (provider) {
    case "groq":
      return groqProvider;
    case "gemini":
    default:
      return geminiProvider;
  }
}

export const llm: LlmProvider = selectProvider();
export type { LlmProvider, GuessClassification, QuestionHistoryItem } from "./types";
