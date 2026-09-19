import { NextRequest, NextResponse } from "next/server";
import { authenticate, postGaveUp } from "@/lib/interview/rooms";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roomId = typeof body?.room_id === "string" ? body.room_id : null;
  const token = typeof body?.token === "string" ? body.token : null;
  if (!roomId || !token) {
    return NextResponse.json({ error: "`room_id` and `token` are required" }, { status: 400 });
  }

  const auth = await authenticate(roomId, token);
  if (!auth) return NextResponse.json({ error: "Room not found or expired." }, { status: 410 });
  if (auth.status === "ended") {
    return NextResponse.json({ error: "This room has already ended." }, { status: 409 });
  }

  await postGaveUp(auth.roomId);
  return NextResponse.json({ ok: true });
}