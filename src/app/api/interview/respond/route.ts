import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";
import { authenticate, postAnswer, postSolved } from "@/lib/interview/rooms";
import { isValidInterviewAnswer } from "@/lib/interview/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roomId = typeof body?.room_id === "string" ? body.room_id : null;
  const token = typeof body?.token === "string" ? body.token : null;
  const action = body?.action; // "answer" | "solved"
  const answer = body?.answer;

  if (!roomId || !token) {
    return NextResponse.json({ error: "`room_id` and `token` are required" }, { status: 400 });
  }
  if (isRateLimited(`interview-respond:${token}`)) {
    return NextResponse.json({ error: "Slow down a little." }, { status: 429 });
  }

  const auth = await authenticate(roomId, token);
  if (!auth) return NextResponse.json({ error: "Room not found or expired." }, { status: 410 });
  if (auth.role !== "answerer") {
    return NextResponse.json({ error: "Only the answerer can respond." }, { status: 403 });
  }
  if (auth.status !== "active") {
    return NextResponse.json({ error: "This room isn't active." }, { status: 409 });
  }

  if (action === "solved") {
    await postSolved(auth.roomId);
    return NextResponse.json({ ok: true });
  }

  if (action === "answer") {
    if (!isValidInterviewAnswer(answer)) {
      return NextResponse.json({ error: "Invalid answer value" }, { status: 400 });
    }
    if (!auth.pendingQuestion) {
      return NextResponse.json({ error: "There's no question waiting to be answered." }, { status: 409 });
    }
    await postAnswer(auth.roomId, answer);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "`action` must be 'answer' or 'solved'" }, { status: 400 });
}