"use client";

import { useEffect, useRef, useState } from "react";
import { TallyCounter } from "@/components/TallyCounter";
import type { Answer, Difficulty } from "@/types";

type TranscriptEntry =
  | { kind: "qa"; question: string; answer: Answer }
  | { kind: "wrong_guess"; question: string };

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

const MAX_NOS = 10;

const DIFFICULTIES: { key: Difficulty; label: string; blurb: string }[] = [
  { key: "easy", label: "Easy", blurb: "Everyday jobs almost everyone recognizes." },
  { key: "medium", label: "Medium", blurb: "Takes a few follow-up questions to pin down." },
  { key: "hard", label: "Hard", blurb: "Specialist roles — sharper questions needed." },
];

type Status = "idle" | "starting" | "active" | "won" | "lost";

export function BlindCaseMode() {
  const [status, setStatus] = useState<Status>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [noCount, setNoCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, asking]);

  useEffect(() => {
    if (status === "active" && !asking) {
      inputRef.current?.focus();
    }
  }, [asking, status]);

  async function startRound(difficulty: Difficulty) {
    setStatus("starting");
    setError(null);
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start Blind Case");
      setSessionId(data.session_id);
      setTranscript([]);
      setNoCount(0);
      setTotalQuestions(0);
      setRevealedTitle(null);
      setStatus("active");
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || !sessionId || asking || status !== "active") return;
    setAsking(true);
    setError(null);
    setInput("");
    try {
      const res = await fetch(`/api/session/${sessionId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      // Deliberately never read `data.hint` here — that omission IS Blind
      // Case. The server still computes and logs it as normal (harmless,
      // no extra cost), it just never gets surfaced in this transcript.
      if (data.wrong_guess) {
        setTranscript((t) => [...t, { kind: "wrong_guess", question }]);
      } else if (data.is_correct_guess) {
        setTranscript((t) => [...t, { kind: "qa", question, answer: "yes" }]);
      } else if (data.answer) {
        setTranscript((t) => [...t, { kind: "qa", question, answer: data.answer }]);
      }

      setNoCount(data.no_count);
      setTotalQuestions(data.total_questions);
      if (data.revealed_title) setRevealedTitle(data.revealed_title);
      setStatus(data.status);
    } catch (err: any) {
      setError(err.message);
      setInput(question);
    } finally {
      setAsking(false);
    }
  }

  async function giveUp() {
    if (!sessionId || status !== "active") return;
    const res = await fetch(`/api/session/${sessionId}/give-up`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setRevealedTitle(data.revealed_title);
      setStatus(data.status);
    }
  }

  const gameOver = status === "won" || status === "lost";

  if (status === "idle") {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="enter w-full max-w-md">
          <p className="font-case text-xs tracking-wide text-manila mb-3 text-center">
            MODE — BLIND CASE
          </p>
          <h2 className="font-case text-2xl mb-4 text-center">No hints. No safety net.</h2>
          <p className="text-paperDim leading-relaxed mb-8 text-center">
            Same rules as a normal round — 10 wrong answers and it&apos;s over — except the case
            notes that would normally unlock at 5 and 8 nos never show up. Pure deduction.
          </p>
          <div className="space-y-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                onClick={() => startRound(d.key)}
                className="w-full text-left border border-wire px-4 py-3 rounded hover:border-manila hover:bg-panelLight transition-colors group"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-case text-base group-hover:text-manila transition-colors">
                    {d.label}
                  </span>
                  <span className="text-paperDim text-xs">{d.blurb}</span>
                </div>
              </button>
            ))}
          </div>
          {error && <p className="text-alert text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  if (status === "starting") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-6">
        <p className="font-case text-sm tracking-wide text-paperDim">OPENING FILE</p>
        <span className="flex gap-1.5">
          <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <RiskBar count={noCount} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-3 min-h-0">
        {transcript.length === 0 && (
          <p className="text-paperDim/70 italic text-center py-8">
            No hints this round — ask a sharp first question.
          </p>
        )}
        {transcript.map((entry, i) => (
          <TranscriptRow key={i} entry={entry} />
        ))}
        {asking && (
          <div className="flex items-center gap-2 text-paperDim/70">
            <span className="font-case text-xs">THINKING</span>
            <span className="flex gap-1">
              <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
              <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
              <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
            </span>
          </div>
        )}

        {gameOver && (
          <div className="bg-panelLight border border-manila/40 rounded-lg p-5 mt-2 space-y-4">
            <div>
              <p className="font-case text-manila text-sm mb-1">
                {status === "won" ? "CASE CLOSED — CORRECT" : "CASE CLOSED"}
              </p>
              {revealedTitle && (
                <p className="text-xl">
                  It was: <span className="font-semibold text-paper">{revealedTitle}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="font-case text-sm border border-manila text-manila px-4 py-2 hover:bg-manila hover:text-ink transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-wire px-6 py-3 flex items-center justify-between gap-4">
        <TallyCounter count={noCount} />
        <div className="text-right shrink-0">
          <p className="font-case text-xs tracking-wide text-paperDim">ASKED</p>
          <p className="font-case text-lg">{totalQuestions}</p>
        </div>
      </div>

      {error && <p className="px-6 py-2 text-alert text-sm">{error}</p>}

      <form onSubmit={ask} className="border-t border-wire p-4 flex gap-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={gameOver || asking}
          placeholder={gameOver ? "Case closed" : "Ask a yes/no question, or guess…"}
          className="flex-1 bg-panel border border-wire rounded px-4 py-3 text-paper placeholder:text-paperDim/50 focus:border-manila outline-none disabled:opacity-40"
          maxLength={300}
        />
        <button
          type="submit"
          disabled={gameOver || asking || !input.trim()}
          className="font-case px-5 py-3 bg-manila text-ink font-semibold hover:bg-manilaDeep disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          {asking ? "…" : "ASK"}
        </button>
        <button
          type="button"
          onClick={giveUp}
          disabled={gameOver}
          className="font-case text-xs tracking-wide border border-wire px-3 text-paperDim hover:border-alert hover:text-alert transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          GIVE UP
        </button>
      </form>
    </div>
  );
}

function RiskBar({ count }: { count: number }) {
  const pct = Math.min(100, (count / MAX_NOS) * 100);
  const danger = count >= 8;
  return (
    <div className="w-full h-1.5 bg-wire/30 shrink-0">
      <div
        className={`h-full transition-all duration-500 ease-out ${danger ? "bg-alert" : "bg-manila"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TranscriptRow({ entry }: { entry: TranscriptEntry }) {
  if (entry.kind === "wrong_guess") {
    return (
      <div className="bg-panel/60 border border-wire rounded-lg px-4 py-3">
        <p className="text-paper/90 italic">&ldquo;{entry.question}&rdquo;</p>
        <p className="font-case text-sm text-paperDim mt-1">✕ Not that one.</p>
      </div>
    );
  }
  return (
    <div className="bg-panel/60 border border-wire rounded-lg px-4 py-3 flex items-start justify-between gap-4">
      <p className="text-paper/90 italic flex-1">&ldquo;{entry.question}&rdquo;</p>
      <span className={`stamp shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[entry.answer]}`}>
        {ANSWER_LABEL[entry.answer]}
      </span>
    </div>
  );
}