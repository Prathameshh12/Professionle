import { NextRequest, NextResponse } from "next/server";
import { getJob, getSession } from "@/lib/session";
import { resolveQuestion } from "@/lib/pipeline";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionId = params.id;

  if (isRateLimited(sessionId)) {
    return NextResponse.json(
      { error: "Slow down a little — max one question every 2 seconds." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "`question` is required" }, { status: 400 });
  }
  if (question.length > 300) {
    return NextResponse.json({ error: "Question is too long" }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status !== "active") {
    return NextResponse.json({ error: "This game has already ended" }, { status: 409 });
  }

  const job = await getJob(session.job_id);
  if (!job) {
    return NextResponse.json({ error: "Assigned job not found" }, { status: 500 });
  }

  try {
    const result = await resolveQuestion(session, job, question);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to resolve question:", err);
    return NextResponse.json(
      { error: err.message ?? "Something went wrong answering that question" },
      { status: 500 }
    );
  }
}
