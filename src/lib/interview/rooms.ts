import { randomUUID } from "crypto";
import { pool } from "@/lib/db";
import { CREATOR_TAG } from "@/lib/constants";
import { generateRoomCode } from "./roomCode";
import type { Answer } from "@/types";
import type { InterviewMessage, InterviewRole } from "./types";

const ROOM_TTL_HOURS = 2;
const MAX_CODE_ATTEMPTS = 5;

export interface CreatedRoom {
  roomId: string;
  roomCode: string;
  answererToken: string;
  jobTitle: string;
  jobProfileProse: string;
}

export async function createRoom(): Promise<CreatedRoom> {
  const { rows: jobRows } = await pool.query(
    `select id, title, profile_prose from jobs where not ($1 = any(tags)) order by random() limit 1`,
    [CREATOR_TAG]
  );
  if (jobRows.length === 0) {
    throw new Error("No jobs available to assign. Run `npm run seed` first.");
  }
  const job = jobRows[0];

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const roomCode = generateRoomCode();
    try {
      const { rows } = await pool.query(
        `insert into interview_rooms (room_code, job_id, job_title, job_profile_prose, expires_at)
         values ($1, $2, $3, $4, now() + interval '${ROOM_TTL_HOURS} hours')
         returning id, answerer_token`,
        [roomCode, job.id, job.title, job.profile_prose]
      );
      return {
        roomId: rows[0].id,
        roomCode,
        answererToken: rows[0].answerer_token,
        jobTitle: job.title,
        jobProfileProse: job.profile_prose,
      };
    } catch (err: any) {
      if (err.code === "23505") continue;
      throw err;
    }
  }
  throw new Error("Could not generate a unique room code — try again.");
}

export async function joinRoom(
  roomCode: string
): Promise<{ roomId: string; askerToken: string } | { error: string }> {
  const { rows } = await pool.query(
    `select id, status, asker_token, expires_at from interview_rooms where room_code = $1`,
    [roomCode.toUpperCase()]
  );
  if (rows.length === 0) return { error: "No room with that code." };
  const room = rows[0];
  if (new Date(room.expires_at).getTime() < Date.now()) return { error: "This room has expired." };
  if (room.status === "ended") return { error: "This room has already ended." };
  if (room.asker_token) return { error: "This room already has two players." };

  const askerToken = randomUUID();
  await pool.query(
    `update interview_rooms
     set asker_token = $1, status = 'active', last_activity_at = now(), asker_last_seen_at = now()
     where id = $2`,
    [askerToken, room.id]
  );
  await pool.query(`insert into interview_messages (room_id, kind, content) values ($1, 'joined', null)`, [
    room.id,
  ]);
  return { roomId: room.id, askerToken };
}

export interface RoomAuth {
  roomId: string;
  role: InterviewRole;
  status: "waiting" | "active" | "ended";
  pendingQuestion: boolean;
  jobTitle: string;
  jobProfileProse: string;
  partnerLastSeenAt: string | null;
}

export async function authenticate(roomId: string, token: string): Promise<RoomAuth | null> {
  const { rows } = await pool.query(
    `select id, answerer_token, asker_token, status, pending_question, job_title, job_profile_prose,
            answerer_last_seen_at, asker_last_seen_at, expires_at
     from interview_rooms where id = $1`,
    [roomId]
  );
  if (rows.length === 0) return null;
  const room = rows[0];
  if (new Date(room.expires_at).getTime() < Date.now()) return null;

  let role: InterviewRole | null = null;
  if (room.answerer_token === token) role = "answerer";
  else if (room.asker_token === token) role = "asker";
  if (!role) return null;

  const partnerLastSeenAt = role === "answerer" ? room.asker_last_seen_at : room.answerer_last_seen_at;
  const ownColumn = role === "answerer" ? "answerer_last_seen_at" : "asker_last_seen_at";
  await pool.query(`update interview_rooms set ${ownColumn} = now() where id = $1`, [roomId]);

  return {
    roomId: room.id,
    role,
    status: room.status,
    pendingQuestion: room.pending_question,
    jobTitle: room.job_title,
    jobProfileProse: room.job_profile_prose,
    partnerLastSeenAt: partnerLastSeenAt ? new Date(partnerLastSeenAt).toISOString() : null,
  };
}

export async function postQuestion(roomId: string, text: string): Promise<void> {
  await pool.query(`insert into interview_messages (room_id, kind, content) values ($1, 'question', $2)`, [
    roomId,
    text,
  ]);
  await pool.query(`update interview_rooms set pending_question = true, last_activity_at = now() where id = $1`, [
    roomId,
  ]);
}

export async function postAnswer(roomId: string, answer: Answer): Promise<void> {
  await pool.query(`insert into interview_messages (room_id, kind, content) values ($1, 'answer', $2)`, [
    roomId,
    answer,
  ]);
  await pool.query(
    `update interview_rooms set pending_question = false, last_activity_at = now() where id = $1`,
    [roomId]
  );
}

export async function postSolved(roomId: string): Promise<void> {
  await pool.query(`insert into interview_messages (room_id, kind, content) values ($1, 'solved', null)`, [
    roomId,
  ]);
  await pool.query(
    `update interview_rooms set status = 'ended', end_reason = 'solved', pending_question = false, last_activity_at = now() where id = $1`,
    [roomId]
  );
}

export async function postGaveUp(roomId: string): Promise<void> {
  await pool.query(`insert into interview_messages (room_id, kind, content) values ($1, 'gave_up', null)`, [
    roomId,
  ]);
  await pool.query(
    `update interview_rooms set status = 'ended', end_reason = 'gave_up', pending_question = false, last_activity_at = now() where id = $1`,
    [roomId]
  );
}

export async function getMessagesSince(roomId: string, sinceSeq: number): Promise<InterviewMessage[]> {
  const { rows } = await pool.query(
    `select seq, kind, content, created_at from interview_messages
     where room_id = $1 and seq > $2 order by seq asc`,
    [roomId, sinceSeq]
  );
  return rows;
}