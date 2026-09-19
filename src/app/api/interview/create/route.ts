import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/interview/rooms";

export async function POST(_req: NextRequest) {
  try {
    const room = await createRoom();
    return NextResponse.json({
      room_id: room.roomId,
      room_code: room.roomCode,
      token: room.answererToken,
      job_title: room.jobTitle,
      job_profile_prose: room.jobProfileProse,
    });
  } catch (err: any) {
    console.error("Failed to create interview room:", err);
    return NextResponse.json({ error: err.message ?? "Could not create a room" }, { status: 500 });
  }
}