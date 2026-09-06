// In-memory, per-process rate limit: fine for a single Node server or for
// keeping a lid on abuse from one browser tab. If you deploy multiple
// instances behind a load balancer, swap this for a Redis INCR + TTL check
// (the interface below is deliberately tiny so that's a drop-in change).

const lastRequestAt = new Map<string, number>();
const MIN_INTERVAL_MS = 2000;

export function isRateLimited(sessionId: string): boolean {
  const now = Date.now();
  const last = lastRequestAt.get(sessionId);
  if (last !== undefined && now - last < MIN_INTERVAL_MS) {
    return true;
  }
  lastRequestAt.set(sessionId, now);
  return false;
}
