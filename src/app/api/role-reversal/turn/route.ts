import { NextRequest, NextResponse } from "next/server";
import { llm } from "@/lib/llm";
import { LlmHttpError } from "@/lib/llm/retry";
import { isRateLimited, tryConsumeRoleReversalBudget } from "@/lib/rateLimit";
import { isValidAnswer, type RoleReversalTurn } from "@/lib/llm/types";

const MAX_TURNS = 20;
const MAX_HISTORY_LENGTH = 40; // hard safety cap, above the real MAX_TURNS

function parseHistory(raw: unknown): RoleReversalTurn[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_HISTORY_LENGTH) return null;
  const parsed: RoleReversalTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const entry = item as Record<string, unknown>;
    if (entry.kind === "qa" && typeof entry.question === "string" && isValidAnswer(entry.answer)) {
      parsed.push({ kind: "qa", question: entry.question.slice(0, 300), answer: entry.answer });
    } else if (entry.kind === "wrong_guess" && typeof entry.guess === "string") {
      parsed.push({ kind: "wrong_guess", guess: entry.guess.slice(0, 100) });
    } else {
      return null;
    }
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roundId = typeof body?.round_id === "string" ? body.round_id : null;
  if (!roundId) {
    return NextResponse.json({ error: "`round_id` is required" }, { status: 400 });
  }
  if (isRateLimited(`role-reversal:${roundId}`)) {
    return NextResponse.json(
      { error: "Slow down a little — max one move every 2 seconds.", retryable: false },
      { status: 429 }
    );
  }

  const history = parseHistory(body?.history);
  if (!history) {
    return NextResponse.json({ error: "Invalid `history` payload" }, { status: 400 });
  }
  if (history.length >= MAX_TURNS) {
    return NextResponse.json({ error: "Turn limit already reached" }, { status: 409 });
  }

  if (!tryConsumeRoleReversalBudget()) {
    return NextResponse.json(
      {
        error: "Role Reversal has hit its play limit for today — it resets tomorrow. The main game is unaffected!",
        retryable: false,
        exhausted: true,
      },
      { status: 503 }
    );
  }

  try {
    const turnsRemaining = MAX_TURNS - history.length;
    const move = await llm.nextRoleReversalMove(history, turnsRemaining);
    return NextResponse.json({ ...move, turn_number: history.length + 1, max_turns: MAX_TURNS });
  } catch (err: any) {
    console.error("Failed to compute role-reversal move:", err);
    if (err instanceof LlmHttpError && err.status === 429) {
      return NextResponse.json(
        {
          error: "Too many questions! — retrying in a few seconds.",
          retryable: true,
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: err.message ?? "Something went wrong picking the next move", retryable: false },
      { status: 500 }
    );
  }
}