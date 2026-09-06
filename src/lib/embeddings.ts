import { mistralEmbed } from "./llm/mistral";

export async function embed(text: string): Promise<number[]> {
  return mistralEmbed(text.trim().toLowerCase());
}

/**
import { geminiEmbed } from "./llm/gemini";

/**
 * Embeddings are always generated via Gemini's text-embedding-004, independent
 * of LLM_PROVIDER, because Groq has no embeddings endpoint. This keeps
 * question_cache and answer_overrides comparable regardless of which model
 * answers questions.
 
export async function embed(text: string): Promise<number[]> {
  return geminiEmbed(text.trim().toLowerCase());
}
*/

