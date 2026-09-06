import { NextRequest, NextResponse } from "next/server";
import { getJob, getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const revealedHints: string[] = [];
  if (session.status !== "active" || session.hints_revealed.length > 0) {
    const job = await getJob(session.job_id);
    if (job) {
      if (session.hints_revealed.includes(5)) revealedHints.push(job.hint_1);
      if (session.hints_revealed.includes(8)) revealedHints.push(job.hint_2);
    }
  }

  let revealedTitle: string | undefined;
  if (session.status !== "active") {
    const job = await getJob(session.job_id);
    revealedTitle = job?.title;
  }

  return NextResponse.json({
    session_id: session.id,
    no_count: session.no_count,
    total_questions: session.total_questions,
    status: session.status,
    hints: revealedHints,
    revealed_title: revealedTitle,
  });
}
