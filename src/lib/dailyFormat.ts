/** Small, pure formatting helpers for the daily puzzle screens. Safe to use in the browser. */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-12" becomes "Thu 12 Nov". Anything that is not a real date is returned unchanged. */
export function formatPuzzleDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return date;
  return `${WEEKDAYS[check.getUTCDay()]} ${d} ${MONTHS[m - 1]}`;
}

/** Milliseconds from now until an ISO timestamp. Negative once it has passed. NaN becomes 0. */
export function msUntil(iso: string, now: number = Date.now()): number {
  const target = Date.parse(iso);
  if (Number.isNaN(target)) return 0;
  return target - now;
}

/** 27_730_000 becomes "07:42:10". Zero or negative becomes "00:00:00". */
export function formatCountdown(ms: number): string {
  const total = ms > 0 ? Math.floor(ms / 1000) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}