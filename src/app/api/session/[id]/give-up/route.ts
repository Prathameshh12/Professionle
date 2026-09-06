import { NextRequest, NextResponse } from "next/server";
import { giveUp } from "@/lib/session";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const result = await giveUp(params.id);
  if (!result) {
    return NextResponse.json({ error: "Session not found or already ended" }, { status: 404 });
  }
  return NextResponse.json({
    status: result.session.status,
    revealed_title: result.job.title,
  });
}
