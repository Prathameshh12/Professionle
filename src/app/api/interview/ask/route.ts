import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";
import { authenticate, postQuestion } from "@/lib/interview/rooms";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roomId = typeof body?.room_id === "string" ? body.room_id : null;
  const token = typeof body?.token === "string" ? body.token : null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!roomId || !token || !question) {
    return NextResponse.json({ error: "`room_id`, `token`, and `question` are required" }, { status: 400 });
  }
  if (question.length > 300) {
    return NextResponse.json({ error: "Question is too long" }, { status: 400 });
  }
  if (isRateLimited(`interview-ask:${token}`)) {
    return NextResponse.json({ error: "Slow down a little." }, { status: 429 });
  }

  const auth = await authenticate(roomId, token);
  if (!auth) return NextResponse.json({ error: "Room not found or expired." }, { status: 410 });
  if (auth.role !== "asker") {
    return NextResponse.json({ error: "Only the asker can ask questions." }, { status: 403 });
  }
  if (auth.status !== "active") {
    return NextResponse.json({ error: "This room isn't active." }, { status: 409 });
  }
  if (auth.pendingQuestion) {
    return NextResponse.json({ error: "Wait for an answer to your last question first." }, { status: 409 });
  }

  await postQuestion(auth.roomId, question);
  return NextResponse.json({ ok: true });
}