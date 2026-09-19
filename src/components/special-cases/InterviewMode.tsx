"use client";

import { useEffect, useState } from "react";
import { InterviewAnswererView } from "./InterviewAnswererView";
import { InterviewAskerView } from "./InterviewAskerView";

const STORAGE_KEY = "professionle-interview-session";

interface StoredSession {
  roomId: string;
  token: string;
  role: "answerer" | "asker";
  roomCode: string;
  jobTitle?: string;
  jobProfileProse?: string;
}

export function InterviewMode() {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [mode, setMode] = useState<"pick" | "create" | "join">("pick");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  function saveSession(s: StoredSession) {
    setSession(s);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  function leaveRoom() {
    setSession(null);
    sessionStorage.removeItem(STORAGE_KEY);
    setMode("pick");
    setJoinCode("");
  }

  async function createRoom() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create a room");
      saveSession({
        roomId: data.room_id,
        token: data.token,
        role: "answerer",
        roomCode: data.room_code,
        jobTitle: data.job_title,
        jobProfileProse: data.job_profile_prose,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_code: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not join that room");
      saveSession({ roomId: data.room_id, token: data.token, role: "asker", roomCode: code });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (session?.role === "answerer") {
    return (
      <InterviewAnswererView
        roomId={session.roomId}
        token={session.token}
        roomCode={session.roomCode}
        jobTitle={session.jobTitle ?? ""}
        jobProfileProse={session.jobProfileProse ?? ""}
        onLeave={leaveRoom}
      />
    );
  }
  if (session?.role === "asker") {
    return (
      <InterviewAskerView roomId={session.roomId} token={session.token} roomCode={session.roomCode} onLeave={leaveRoom} />
    );
  }

  return (
    <div className="h-full flex items-center justify-center px-6 py-12">
      <div className="enter w-full max-w-md text-center">
        <p className="font-case text-xs tracking-wide text-manila mb-3">MODE — INTERVIEW</p>
        <h2 className="font-case text-2xl mb-4">A real person on the other end.</h2>
        <p className="text-paperDim leading-relaxed mb-8">
          Two players, two devices. One of you gets secretly assigned a real job and answers
          honestly by hand — no AI involved. The other asks the questions.
        </p>

        {mode === "pick" && (
          <div className="space-y-2">
            <button
              onClick={() => {
                setMode("create");
                createRoom();
              }}
              className="w-full font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors"
            >
              CREATE A ROOM (be the answerer)
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full font-case text-sm border border-wire text-paperDim px-5 py-3 hover:border-manila hover:text-manila transition-colors"
            >
              JOIN A ROOM (be the asker)
            </button>
          </div>
        )}

        {mode === "create" && busy && <p className="font-case text-sm text-paperDim">Setting up your room…</p>}

        {mode === "join" && (
          <div className="space-y-3">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              maxLength={5}
              className="w-full text-center tracking-[0.3em] font-case text-lg bg-panel border border-wire rounded px-4 py-3 text-paper placeholder:text-paperDim/50 focus:border-manila outline-none"
            />
            <button
              onClick={joinRoom}
              disabled={busy || !joinCode.trim()}
              className="w-full font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {busy ? "JOINING…" : "JOIN"}
            </button>
            <button
              onClick={() => {
                setMode("pick");
                setError(null);
              }}
              className="font-case text-xs text-paperDim underline decoration-wire underline-offset-4 hover:text-manila"
            >
              back
            </button>
          </div>
        )}

        {error && <p className="text-alert text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}