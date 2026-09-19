"use client";

import { useEffect, useRef, useState } from "react";
import { useInterviewPoll } from "@/hooks/useInterviewPoll";
import type { Answer } from "@/types";

const ANSWER_LABEL: Record<Answer, string> = {
  yes: "YES",
  no: "NO",
  sometimes: "SOMETIMES",
  not_really: "NOT REALLY",
  irrelevant: "N/A",
};

const ANSWER_COLOR: Record<Answer, string> = {
  yes: "text-emerald-400 border-emerald-400",
  no: "text-alert border-alert",
  sometimes: "text-manila border-manila",
  not_really: "text-alert/80 border-alert/80",
  irrelevant: "text-paperDim border-paperDim",
};

export function InterviewAskerView({
  roomId,
  token,
  roomCode,
  onLeave,
}: {
  roomId: string;
  token: string;
  roomCode: string;
  onLeave: () => void;
}) {
  const { messages, status, pendingQuestion, error, gone, partnerAway } = useInterviewPoll(roomId, token, true);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (status === "active" && !pendingQuestion && !asking) inputRef.current?.focus();
  }, [status, pendingQuestion, asking]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || asking || pendingQuestion || status !== "active") return;
    setAsking(true);
    setAskError(null);
    try {
      const res = await fetch("/api/interview/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, token, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setInput("");
    } catch (err: any) {
      setAskError(err.message);
    } finally {
      setAsking(false);
    }
  }

  async function giveUp() {
    await fetch("/api/interview/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId, token }),
    });
  }

  async function handleLeave() {
    if (status === "active") {
      await giveUp();
    }
    onLeave();
  }

  if (gone) {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="enter w-full max-w-md text-center">
          <p className="font-case text-xs tracking-wide text-alert mb-3">ROOM NO LONGER AVAILABLE</p>
          <p className="text-paperDim leading-relaxed mb-8">
            This room has expired or was never found. Start or join a fresh one whenever you&apos;re
            ready.
          </p>
          <button
            onClick={onLeave}
            className="font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-6 pt-4">
        <span className="font-case text-xs tracking-wide text-paperDim">ROOM {roomCode} — YOU&apos;RE THE ASKER</span>
        {status === "active" && (
          <button
            onClick={handleLeave}
            className="font-case text-xs tracking-wide border border-wire px-3 py-1.5 text-paperDim hover:border-alert hover:text-alert transition-colors"
          >
            END ROUND
          </button>
        )}
      </div>

      {status === "active" && partnerAway && (
        <div className="mx-6 mt-3 border border-alert/40 bg-alertDim/20 rounded-lg px-4 py-2.5">
          <p className="text-alert text-xs">
            The answerer might have stepped away — no activity from them in a little while. Feel free
            to end the round if they don&apos;t come back.
          </p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-paperDim/70 italic text-center py-4">
            Ask a yes/no question, or name the job outright if you think you&apos;ve got it.
          </p>
        )}
        {messages.map((m) => (
          <AskerMessageRow key={m.seq} kind={m.kind} content={m.content} />
        ))}
        {pendingQuestion && status === "active" && (
          <p className="text-paperDim/70 text-xs text-center italic">Waiting for their answer…</p>
        )}
        {status === "ended" && (
          <div className="bg-panelLight border border-manila/40 rounded-lg p-5 mt-2">
            <p className="font-case text-manila text-sm mb-1">ROUND OVER</p>
            <p className="text-paper/90">
              {messages.some((m) => m.kind === "solved") ? "You got it!" : "The round ended before you guessed it."}
            </p>
            <button
              onClick={onLeave}
              className="font-case text-sm border border-manila text-manila px-4 py-2 mt-3 hover:bg-manila hover:text-ink transition-colors"
            >
              BACK TO MENU
            </button>
          </div>
        )}
      </div>

      {(error || askError) && <p className="px-6 py-2 text-alert text-sm">{error ?? askError}</p>}

      {status === "active" && (
        <form onSubmit={ask} className="border-t border-wire p-4 flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={asking || pendingQuestion}
            placeholder={pendingQuestion ? "Waiting for an answer…" : "Ask a yes/no question, or guess…"}
            className="flex-1 bg-panel border border-wire rounded px-4 py-3 text-paper placeholder:text-paperDim/50 focus:border-manila outline-none disabled:opacity-40"
            maxLength={300}
          />
          <button
            type="submit"
            disabled={asking || pendingQuestion || !input.trim()}
            className="font-case px-5 py-3 bg-manila text-ink font-semibold hover:bg-manilaDeep disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            {asking ? "…" : "ASK"}
          </button>
        </form>
      )}
    </div>
  );
}

function AskerMessageRow({ kind, content }: { kind: string; content: string | null }) {
  if (kind === "joined") return null;
  if (kind === "question") {
    return (
      <div className="flex justify-end">
        <div className="bg-panel/60 border border-wire rounded-lg px-4 py-3 max-w-[80%]">
          <p className="text-paper/90 italic">&ldquo;{content}&rdquo;</p>
        </div>
      </div>
    );
  }
  if (kind === "answer") {
    const answer = content as Answer;
    return (
      <span className={`inline-block font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[answer]}`}>
        {ANSWER_LABEL[answer]}
      </span>
    );
  }
  return null;
}