import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: logs } = await pool.query(
    `select ql.id, ql.question_text, ql.resolved_answer, ql.was_guess_attempt, ql.source,
            ql.created_at, j.title as job_title, j.id as job_id
     from question_log ql
     join game_sessions gs on gs.id = ql.session_id
     join jobs j on j.id = gs.job_id
     order by ql.created_at desc
     limit 300`
  );

  const { rows: jobs } = await pool.query(`select id, title from jobs order by title asc`);

  return NextResponse.json({ logs, jobs });
}
