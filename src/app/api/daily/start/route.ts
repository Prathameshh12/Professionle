import { NextResponse } from "next/server";
import { getTodaysPuzzle, nextPuzzleStart } from "@/lib/daily";
import { startSessionForJob } from "@/lib/session";

// Always run fresh. Today's puzzle changes at midnight Sydney time.
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const puzzle = await getTodaysPuzzle();
    const session = await startSessionForJob(puzzle.jobId, puzzle.date);
    // Never return the job itself. The client only gets what it needs to play and to label the day.
    return NextResponse.json({
      session_id: session.id,
      status: session.status,
      puzzle_number: puzzle.number,
      puzzle_date: puzzle.date,
      next_puzzle_at: nextPuzzleStart(puzzle.date).toISOString(),
    });
  } catch (err) {
    console.error("Failed to start daily puzzle:", err);
    return NextResponse.json({ error: "Could not start today's puzzle. Please try again." }, { status: 500 });
  }
}