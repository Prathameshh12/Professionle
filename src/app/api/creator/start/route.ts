import { NextRequest, NextResponse } from "next/server";
import { startCreatorSession } from "@/lib/session";

export async function POST(_req: NextRequest) {
  try {
    const session = await startCreatorSession();
    return NextResponse.json({ session_id: session.id, status: session.status });
  } catch (err: any) {
    console.error("Failed to start creator session:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to start creator session" },
      { status: 500 }
    );
  }
}