import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { addDays, getOrCreatePuzzle, todayInZone } from "@/lib/daily";

// Called once a day by Vercel Cron. It keeps the free database awake and makes sure
// today's and tomorrow's puzzles already exist, so the first player of the day never waits.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: { db: string; today: string; tomorrow: string } = { db: "ok", today: "ok", tomorrow: "ok" };

  try {
    await pool.query("select 1");
  } catch (err) {
    console.error("Keepalive: database check failed:", err);
    result.db = "failed";
  }

  const today = todayInZone();
  for (const [key, date] of [["today", today], ["tomorrow", addDays(today, 1)]] as const) {
    try {
      await getOrCreatePuzzle(date);
    } catch (err) {
      console.error(`Keepalive: could not prepare the ${key} puzzle:`, err);
      result[key] = "failed";
    }
  }

  const allOk = result.db === "ok" && result.today === "ok" && result.tomorrow === "ok";
  return NextResponse.json(result, { status: allOk ? 200 : 500 });
}