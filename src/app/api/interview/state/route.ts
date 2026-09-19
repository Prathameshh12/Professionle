import { NextRequest, NextResponse } from "next/server";
import { authenticate, getMessagesSince } from "@/lib/interview/rooms";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roomId = typeof body?.room_id === "string" ? body.room_id : null;
  const token = typeof body?.token === "string" ? body.token : null;
  const since = typeof body?.since === "number" ? body.since : 0;

  if (!roomId || !token) {
    return NextResponse.json({ error: "`room_id` and `token` are required" }, { status: 400 });
  }

  const auth = await authenticate(roomId, token);
  if (!auth) return NextResponse.json({ error: "Room not found or expired." }, { status: 410 });

  const messages = await getMessagesSince(auth.roomId, since);
  return NextResponse.json({
    role: auth.role,
    status: auth.status,
    pending_question: auth.pendingQuestion,
    messages,
    partner_last_seen_at: auth.partnerLastSeenAt,
  });
}