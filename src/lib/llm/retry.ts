/** Thrown by provider fetch calls so the retry logic can tell transient
 * server errors (worth retrying) apart from permanent ones (not worth it). */
export class LlmHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "LlmHttpError";
    this.status = status;
  }
}

// 429 = rate limited, 500/502/503/504 = the provider's own infrastructure
// having a bad moment. All of these are worth waiting a beat and trying again.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function isRetryable(err: unknown): boolean {
  if (err instanceof LlmHttpError) return RETRYABLE_STATUS.has(err.status);
  // Anything else reaching here is almost always the model returning
  // malformed JSON or an invalid enum value — a fresh attempt often just
  // works, since it's model non-determinism, not a systemic problem.
  return true;
}

/**
 * Retries `fn` on transient failures with exponential backoff + jitter.
 * Malformed-output errors (bad JSON, invalid answer value) retry immediately
 * since there's nothing to wait out. HTTP errors like 503 "model overloaded"
 * back off for real, since an instant retry usually just hits the same
 * overloaded state again.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts - 1 || !isRetryable(err)) throw err;
      if (err instanceof LlmHttpError) {
        const backoffMs = 500 * 2 ** attempt + Math.random() * 250; // ~0.5s, 1s, 2s (+jitter)
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
      // else: malformed-output retry, no need to wait
    }
  }
  throw lastErr;
}