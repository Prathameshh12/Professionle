import { NextRequest, NextResponse } from "next/server";
import { llm } from "@/lib/llm";
import { isRateLimited } from "@/lib/rateLimit";
import { isValidAnswer, type QuestionHistoryItem } from "@/lib/llm/types";
import { verifyRound } from "@/lib/two-truths/token";
import { getPairById } from "@/lib/two-truths/pairs";

const MAX_HISTORY_LENGTH = 30;

function parseHistory(raw: unknown): QuestionHistoryItem[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_HISTORY_LENGTH) return null;
  const parsed: QuestionHistoryItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const entry = item as Record<string, unknown>;
    if (typeof entry.question === "string" && isValidAnswer(entry.answer)) {
      parsed.push({ question: entry.question.slice(0, 300), answer: entry.answer });
    } else {
      return null;
    }
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roundToken = typeof body?.round_token === "string" ? body.round_token : null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!roundToken) {
    return NextResponse.json({ error: "`round_token` is required" }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: "`question` is required" }, { status: 400 });
  }
  if (question.length > 300) {
    return NextResponse.json({ error: "Question is too long" }, { status: 400 });
  }

  const payload = verifyRound(roundToken);
  if (!payload) {
    return NextResponse.json({ error: "This round has expired — start a new one." }, { status: 410 });
  }

  if (isRateLimited(`two-truths:${payload.nonce}`)) {
    return NextResponse.json(
      { error: "Slow down a little — max one question every 2 seconds." },
      { status: 429 }
    );
  }

  const history = parseHistory(body?.history);
  if (!history) {
    return NextResponse.json({ error: "Invalid `history` payload" }, { status: 400 });
  }

  const pair = getPairById(payload.pairId);
  if (!pair) {
    return NextResponse.json({ error: "Unknown pair" }, { status: 500 });
  }
  const targetJob = payload.target === "A" ? pair.jobA : pair.jobB;

  try {
    const answer = await llm.answerQuestion({
      profileProse: targetJob.profileProse,
      tags: targetJob.tags,
      history,
      question,
    });
    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Failed to resolve Two Truths question:", err);
    return NextResponse.json(
      { error: err.message ?? "Something went wrong answering that question" },
      { status: 500 }
    );
  }
}