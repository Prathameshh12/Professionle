import { LlmHttpError, withRetry } from "./retry";

const MISTRAL_EMBEDDING_MODEL = "mistral-embed";
const BASE_URL = "https://api.mistral.ai/v1";

function apiKey(): string {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("MISTRAL_API_KEY is not set");
  return key;
}

export async function mistralEmbed(text: string): Promise<number[]> {
  return withRetry(async () => {
    const res = await fetch(`${BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        model: MISTRAL_EMBEDDING_MODEL,
        input: text,
      }),
    });
    if (!res.ok) {
      throw new LlmHttpError(res.status, `Mistral embedding error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const values: number[] | undefined = data?.data?.[0]?.embedding;
    if (!values) throw new Error("Mistral embedding API returned no values");
    return values;
  });
}