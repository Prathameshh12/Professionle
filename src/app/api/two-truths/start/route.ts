import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { signRound } from "@/lib/two-truths/token";
import { getPairById, getRandomPair } from "@/lib/two-truths/pairs";
import { MAX_TURNS, MIN_QUESTIONS_BEFORE_GUESS, ROUND_TTL_MS } from "@/lib/two-truths/config";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // Optional — lets you test a specific pair manually (e.g. via curl). The
  // real UI never sends this, so a round is normally random.
  const requestedPairId = typeof body?.pair_id === "string" ? body.pair_id : null;

  const pair = requestedPairId ? getPairById(requestedPairId) : getRandomPair();
  if (!pair) {
    return NextResponse.json({ error: "Unknown pair_id" }, { status: 400 });
  }

  const target: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
  const round_token = signRound({
    pairId: pair.id,
    target,
    nonce: randomUUID(),
    exp: Date.now() + ROUND_TTL_MS,
  });

  return NextResponse.json({
    round_token,
    pair_id: pair.id,
    job_a_title: pair.jobA.title,
    job_b_title: pair.jobB.title,
    max_turns: MAX_TURNS,
    min_questions: MIN_QUESTIONS_BEFORE_GUESS,
  });
}