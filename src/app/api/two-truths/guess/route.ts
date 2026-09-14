import { NextRequest, NextResponse } from "next/server";
import { verifyRound } from "@/lib/two-truths/token";
import { getPairById } from "@/lib/two-truths/pairs";
import { MIN_QUESTIONS_BEFORE_GUESS } from "@/lib/two-truths/config";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roundToken = typeof body?.round_token === "string" ? body.round_token : null;
  const guess = body?.guess;
  const questionCount = typeof body?.question_count === "number" ? body.question_count : 0;

  if (!roundToken || (guess !== "A" && guess !== "B")) {
    return NextResponse.json(
      { error: "`round_token` and `guess` ('A' or 'B') are required" },
      { status: 400 }
    );
  }

  const payload = verifyRound(roundToken);
  if (!payload) {
    return NextResponse.json({ error: "This round has expired — start a new one." }, { status: 410 });
  }

  if (questionCount < MIN_QUESTIONS_BEFORE_GUESS) {
    return NextResponse.json(
      { error: `Ask at least ${MIN_QUESTIONS_BEFORE_GUESS} questions before calling it.` },
      { status: 400 }
    );
  }

  const pair = getPairById(payload.pairId);
  if (!pair) {
    return NextResponse.json({ error: "Unknown pair" }, { status: 500 });
  }

  const targetJob = payload.target === "A" ? pair.jobA : pair.jobB;
  const correct = guess === payload.target;

  return NextResponse.json({
    correct,
    target_title: targetJob.title,
    shared_facts_summary: pair.sharedFactsSummary,
  });
}