import { NextRequest, NextResponse } from "next/server";
import { startSession } from "@/lib/session";
import type { Difficulty } from "@/types";

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export async function POST(req: NextRequest) {
  let difficulty: Difficulty | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.difficulty) {
      if (!VALID_DIFFICULTIES.includes(body.difficulty)) {
        return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
      }
      difficulty = body.difficulty;
    }
  } catch {
    // no body / not JSON — that's fine, difficulty stays undefined
  }

  try {
    const session = await startSession(difficulty);
    // Never return the job itself — only the session id the client needs.
    return NextResponse.json({ session_id: session.id, status: session.status });
  } catch (err: any) {
    console.error("Failed to start session:", err);
    return NextResponse.json({ error: err.message ?? "Failed to start session" }, { status: 500 });
  }
}
