import { NextRequest, NextResponse } from "next/server";
import { pool, toVectorLiteral } from "@/lib/db";
import { embed } from "@/lib/embeddings";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { isValidAnswer } from "@/lib/llm/types";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { rows } = await pool.query(
    `select o.id, o.job_id, j.title as job_title, o.question_pattern, o.forced_answer, o.created_at
     from answer_overrides o join jobs j on j.id = o.job_id
     order by o.created_at desc limit 200`
  );
  return NextResponse.json({ overrides: rows });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const jobId = body?.job_id;
  const questionPattern = typeof body?.question_pattern === "string" ? body.question_pattern.trim() : "";
  const forcedAnswer = body?.forced_answer;

  if (!jobId || !questionPattern || !isValidAnswer(forcedAnswer)) {
    return NextResponse.json(
      { error: "job_id, question_pattern, and a valid forced_answer are required" },
      { status: 400 }
    );
  }

  const embedding = await embed(questionPattern);
  const { rows } = await pool.query(
    `insert into answer_overrides (job_id, question_pattern, question_embedding, forced_answer)
     values ($1, $2, $3::vector, $4)
     returning id, job_id, question_pattern, forced_answer, created_at`,
    [jobId, questionPattern, toVectorLiteral(embedding), forcedAnswer]
  );

  return NextResponse.json({ override: rows[0] }, { status: 201 });
}
