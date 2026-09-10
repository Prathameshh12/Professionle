"use client";

import { useEffect, useRef, useState } from "react";
import { TallyCounter } from "@/components/TallyCounter";
import type { Answer, Difficulty } from "@/types";

type TranscriptEntry =
  | { kind: "qa"; question: string; answer: Answer }
  | { kind: "wrong_guess"; question: string }
  | { kind: "hint"; level: 5 | 8; text: string };

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

export default function GamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "won" | "lost">("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [noCount, setNoCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [transcript, asking]);

  async function startGame(difficulty?: Difficulty) {
    setStatus("starting");
    setError(null);
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(difficulty ? { difficulty } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not open a case");
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

      if (data.wrong_guess) {
        setTranscript((t) => [...t, { kind: "wrong_guess", question }]);
      } else if (data.is_correct_guess) {
        setTranscript((t) => [...t, { kind: "qa", question, answer: "yes" }]);
      } else if (data.answer) {
        setTranscript((t) => [...t, { kind: "qa", question, answer: data.answer }]);
        if (data.hint) {
          const level = data.no_count >= 8 ? 8 : 5;
          setTranscript((t) => [...t, { kind: "hint", level, text: data.hint }]);
        }
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

  /** Sends the player back to the difficulty-select screen instead of starting a new game directly. */
  function backToMenu() {
    setSessionId(null);
    setStatus("idle");
    setTranscript([]);
    setNoCount(0);
    setTotalQuestions(0);
    setRevealedTitle(null);
    setError(null);
  }

  if (status === "idle" || status === "starting") {
    return <StartScreen onStart={startGame} loading={status === "starting"} error={error} />;
  }

  const gameOver = status === "won" || status === "lost";

  return (
    <main className="vignette min-h-screen flex flex-col">
      <header className="border-b border-wire px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-case text-xs tracking-wide text-manila">CASE FILE — OPEN</p>
          <h1 className="font-case text-xl">Professionle</h1>
        </div>
        <button
          onClick={giveUp}
          disabled={gameOver}
          className="font-case text-xs tracking-wide border border-wire px-3 py-2 text-paperDim hover:border-alert hover:text-alert transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          GIVE UP
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 min-h-0">
          {transcript.length === 0 && (
            <p className="text-paperDim/60 italic">
              The subject is seated across from you. Start asking questions — yes or no only.
            </p>
          )}
          {transcript.map((entry, i) => (
            <TranscriptRow key={i} entry={entry} />
          ))}
          {asking && <ThinkingIndicator />}
          {gameOver && revealedTitle && (
            <div className="border-t border-wire pt-4 mt-4">
              <p className="font-case text-manila text-sm mb-1">
                {status === "won" ? "CASE CLOSED — CORRECT" : "CASE CLOSED"}
              </p>
              <p className="text-2xl">
                The job was: <span className="font-semibold text-paper">{revealedTitle}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => startGame()}
                  className="font-case text-sm border border-manila text-manila px-4 py-2 hover:bg-manila hover:text-ink transition-colors"
                >
                  PLAY AGAIN (RANDOM)
                </button>
                <button
                  onClick={backToMenu}
                  className="font-case text-sm border border-wire text-paperDim px-4 py-2 hover:border-manila hover:text-manila transition-colors"
                >
                  CHOOSE DIFFICULTY
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="md:w-72 border-t md:border-t-0 md:border-l border-wire px-6 py-6 space-y-6">
          <TallyCounter count={noCount} />
          <div>
            <p className="font-case text-xs tracking-wide text-paperDim mb-1">QUESTIONS ASKED</p>
            <p className="text-2xl font-case">{totalQuestions}</p>
          </div>
          <div className="text-xs text-paperDim/70 leading-relaxed">
            Hints unlock automatically at 5 and 8 &ldquo;no&rdquo; answers. Ten &ldquo;no&rdquo;
            answers and the case goes cold — guess the exact title any time to close it early.
          </div>
        </aside>
      </div>

      {error && <p className="px-6 py-2 text-alert text-sm">{error}</p>}

      <form onSubmit={ask} className="border-t border-wire p-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={gameOver || asking}
          placeholder={gameOver ? "Case closed" : "Ask a yes/no question, or name the job…"}
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
      </form>
    </main>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-paperDim/70">
      <span className="font-case text-xs">THINKING</span>
      <span className="flex gap-1">
        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
      </span>
    </div>
  );
}

function TranscriptRow({ entry }: { entry: TranscriptEntry }) {
  if (entry.kind === "hint") {
    return (
      <div className="border border-manila/50 bg-panelLight px-4 py-3">
        <p className="font-case text-xs text-manila mb-1">
          CASE NOTE — UNLOCKED AT {entry.level} NOS
        </p>
        <p className="text-paper/90">{entry.text}</p>
      </div>
    );
  }
  if (entry.kind === "wrong_guess") {
    return (
      <div>
        <p className="text-paper/90 italic">&ldquo;{entry.question}&rdquo;</p>
        <p className="font-case text-sm text-paperDim mt-1">✕ Not that one.</p>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-paper/90 italic flex-1">&ldquo;{entry.question}&rdquo;</p>
      <span
        className={`stamp shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[entry.answer]}`}
      >
        {ANSWER_LABEL[entry.answer]}
      </span>
    </div>
  );
}

function StartScreen({
  onStart,
  loading,
  error,
}: {
  onStart: (difficulty?: Difficulty) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <main className="vignette min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="font-case text-xs tracking-wide text-manila mb-2">A GUESSING GAME</p>
        <h1 className="font-case text-3xl mb-4">Professionle</h1>
        <p className="text-paperDim mb-8 leading-relaxed">
          Somewhere in this file is a profession. You get ten &ldquo;no&rdquo; answers before the
          trail goes cold. Ask anything — hints unlock along the way.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => onStart(d)}
              disabled={loading}
              className="font-case text-sm border border-wire px-4 py-3 hover:border-manila hover:text-manila transition-colors disabled:opacity-40"
            >
              {d.toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => onStart()}
            disabled={loading}
            className="font-case text-sm border border-wire px-4 py-3 hover:border-manila hover:text-manila transition-colors disabled:opacity-40"
          >
            SURPRISE ME
          </button>
        </div>
        {loading && <p className="text-paperDim text-sm">Opening the file…</p>}
        {error && <p className="text-alert text-sm mt-2">{error}</p>}
      </div>
    </main>
  );
}