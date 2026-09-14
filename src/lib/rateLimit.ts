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

// ---------------------------------------------------------------------------
// Role Reversal daily budget: a soft, app-level cap on how many Role Reversal
// turns get served per day, well under Groq's account-wide daily request
// limit for the model we use. Role Reversal makes one uncached LLM call per
// turn — unlike the main game, which caches most answers — so it's by far
// the heaviest per-round consumer of that shared quota. This guard exists
// purely so Role Reversal can never exhaust the day's entire quota and take
// the main game down with it.
//
// Caveat: like isRateLimited above, this is in-memory and per-process. On a
// single long-running Node server this is exact. On serverless platforms
// (Vercel, etc.) with multiple warm instances, each instance keeps its own
// count, so the real ceiling on a busy day is somewhat higher than
// ROLE_REVERSAL_DAILY_BUDGET (roughly budget × number of warm instances).
// It's still a meaningful safety net, just not a mathematically exact one —
// for a hard guarantee, swap this for a Redis INCR with a 24h TTL.
const ROLE_REVERSAL_DAILY_BUDGET = 200;
let budgetDayKey = "";
let budgetUsedToday = 0;

function currentDayKey(): string {
  return new Date().toISOString().slice(0, 10); // resets at UTC midnight
}

/** Returns true and consumes one unit of budget if under the daily cap, false if exhausted. */
export function tryConsumeRoleReversalBudget(): boolean {
  const key = currentDayKey();
  if (key !== budgetDayKey) {
    budgetDayKey = key;
    budgetUsedToday = 0;
  }
  if (budgetUsedToday >= ROLE_REVERSAL_DAILY_BUDGET) return false;
  budgetUsedToday += 1;
  return true;
}