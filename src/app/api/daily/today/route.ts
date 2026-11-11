import { NextResponse } from "next/server";
import { getTodaysPuzzle, nextPuzzleStart } from "@/lib/daily";

// Always run fresh. Today's puzzle changes at midnight Sydney time.
export const dynamic = "force-dynamic";

/** Tells the home screen which puzzle is live and when the next one starts. It never reveals the job. */
export async function GET() {
  try {
    const puzzle = await getTodaysPuzzle();
    return NextResponse.json(
      {
        puzzle_number: puzzle.number,
        puzzle_date: puzzle.date,
        next_puzzle_at: nextPuzzleStart(puzzle.date).toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Failed to load today's puzzle:", err);
    return NextResponse.json({ error: "Could not load today's puzzle." }, { status: 500 });
  }
}