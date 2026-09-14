// Shared knobs for a Two Truths round. Kept in one place so /start and
// /guess can't drift out of sync — the frontend never hardcodes these
// either, it reads them straight off the /start response.
export const MAX_TURNS = 15;
export const MIN_QUESTIONS_BEFORE_GUESS = 2;
export const ROUND_TTL_MS = 45 * 60 * 1000; // 45 minutes