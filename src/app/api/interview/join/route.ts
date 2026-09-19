import { NextRequest, NextResponse } from "next/server";
import { joinRoom } from "@/lib/interview/rooms";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const roomCode = typeof body?.room_code === "string" ? body.room_code.trim() : "";
  if (!roomCode) {
    return NextResponse.json({ error: "`room_code` is required" }, { status: 400 });
  }

  const result = await joinRoom(roomCode);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ room_id: result.roomId, token: result.askerToken });
}