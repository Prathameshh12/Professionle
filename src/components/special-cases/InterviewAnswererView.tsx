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

const ANSWER_ORDER: Answer[] = ["yes", "no", "sometimes", "not_really", "irrelevant"];

export function InterviewAnswererView({
  roomId,
  token,
  roomCode,
  jobTitle,
  jobProfileProse,
  onLeave,
}: {
  roomId: string;
  token: string;
  roomCode: string;
  jobTitle: string;
  jobProfileProse: string;
  onLeave: () => void;
}) {
  const { messages, status, pendingQuestion, error, gone, partnerAway } = useInterviewPoll(roomId, token, true);
  const [showProfile, setShowProfile] = useState(false);
  const [responding, setResponding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function respond(action: "answer" | "solved", answer?: Answer) {
    if (responding) return;
    setResponding(true);
    try {
      await fetch("/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, token, action, answer }),
      });
    } finally {
      setResponding(false);
    }
  }

  async function giveUp() {
    await fetch("/api/interview/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId, token }),
    });
  }

  // Proactively end the round (if it's still live) before actually leaving,
  // so the other side finds out immediately instead of waiting on the
  // passive presence timeout.
  async function handleLeave() {
    if (status === "waiting" || status === "active") {
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
            This room has expired or was never found. Start a fresh one whenever you&apos;re ready.
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

  if (status === "waiting") {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="enter w-full max-w-md text-center">
          <p className="font-case text-xs tracking-wide text-manila mb-3">ROOM CODE</p>
          <p className="font-case text-5xl tracking-[0.3em] text-paper mb-6">{roomCode}</p>
          <p className="text-paperDim leading-relaxed mb-2">
            Share this code with whoever&apos;s asking. Once they join, you&apos;ll see it here.
          </p>
          <p className="font-case text-sm text-paperDim mb-8">
            You&apos;ve been assigned: <span className="text-manila">{jobTitle}</span>
          </p>
          <button
            onClick={handleLeave}
            className="font-case text-xs text-paperDim underline decoration-wire underline-offset-4 hover:text-manila"
          >
            cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-6 pt-4">
        <span className="font-case text-xs tracking-wide text-paperDim">
          YOU&apos;RE THE ANSWERER — {jobTitle.toUpperCase()}
        </span>
        {status === "active" && (
          <button
            onClick={handleLeave}
            className="font-case text-xs tracking-wide border border-wire px-3 py-1.5 text-paperDim hover:border-alert hover:text-alert transition-colors"
          >
            END ROUND
          </button>
        )}
      </div>

      <div className="px-6 pt-3">
        <button
          onClick={() => setShowProfile((s) => !s)}
          className="font-case text-xs text-manila underline decoration-manila/40 underline-offset-4"
        >
          {showProfile ? "hide reference notes" : "show reference notes"}
        </button>
        {showProfile && (
          <div className="mt-2 border border-wire bg-panel/60 rounded-lg px-4 py-3 max-h-40 overflow-y-auto">
            <p className="text-paper/80 text-sm leading-relaxed">{jobProfileProse}</p>
          </div>
        )}
      </div>

      {status === "active" && partnerAway && (
        <div className="mx-6 mt-3 border border-alert/40 bg-alertDim/20 rounded-lg px-4 py-2.5">
          <p className="text-alert text-xs">
            The asker might have stepped away — no activity from them in a little while. Feel free to
            end the round if they don&apos;t come back.
          </p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-paperDim/70 italic text-center py-4">Waiting for the first question…</p>
        )}
        {messages.map((m) => (
          <AnswererMessageRow key={m.seq} kind={m.kind} content={m.content} />
        ))}
        {status === "ended" && (
          <div className="bg-panelLight border border-manila/40 rounded-lg p-5 mt-2 space-y-3">
            <div>
              <p className="font-case text-manila text-sm mb-1">ROUND OVER</p>
              <p className="text-paper/90">
                {messages.some((m) => m.kind === "solved")
                  ? "They got it!"
                  : "The round ended before they guessed it."}
              </p>
            </div>
            <button
              onClick={onLeave}
              className="font-case text-sm border border-manila text-manila px-4 py-2 hover:bg-manila hover:text-ink transition-colors"
            >
              BACK TO MENU
            </button>
          </div>
        )}
      </div>

      {error && <p className="px-6 py-2 text-alert text-sm">{error}</p>}

      {status === "active" && pendingQuestion && (
        <div className="border-t border-wire p-4 space-y-2">
          <p className="font-case text-xs tracking-wide text-paperDim text-center mb-1">ANSWER HONESTLY</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {ANSWER_ORDER.map((a) => (
              <button
                key={a}
                onClick={() => respond("answer", a)}
                disabled={responding}
                className={`font-case text-sm border-2 px-4 py-2 transition-colors hover:bg-panel disabled:opacity-40 ${ANSWER_COLOR[a]}`}
              >
                {ANSWER_LABEL[a]}
              </button>
            ))}
          </div>
          <button
            onClick={() => respond("solved")}
            disabled={responding}
            className="w-full font-case text-sm border-2 border-emerald-400 text-emerald-400 px-4 py-2 mt-2 hover:bg-emerald-400 hover:text-ink transition-colors disabled:opacity-40"
          >
            THEY GUESSED IT CORRECTLY — END ROUND
          </button>
        </div>
      )}
    </div>
  );
}

function AnswererMessageRow({ kind, content }: { kind: string; content: string | null }) {
  if (kind === "joined") {
    return <p className="text-paperDim/70 text-xs text-center italic">Asker joined the room.</p>;
  }
  if (kind === "question") {
    return (
      <div className="bg-panel/60 border border-wire rounded-lg px-4 py-3">
        <p className="text-paper/90 italic">&ldquo;{content}&rdquo;</p>
      </div>
    );
  }
  if (kind === "answer") {
    const answer = content as Answer;
    return (
      <div className="flex justify-end">
        <span className={`font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[answer]}`}>{ANSWER_LABEL[answer]}</span>
      </div>
    );
  }
  return null;
}