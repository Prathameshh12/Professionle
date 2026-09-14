"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TallyCounter } from "@/components/TallyCounter";
import { Logo } from "@/components/logo";
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
  const [booting, setBooting] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "won" | "lost">("idle");
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
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

  // Splash screen on first load — purely cosmetic, gives the app a "loading in" feel.
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Refocus the question box the moment it's re-enabled, so typing the next
  // question doesn't require clicking back into it every single time.
  useEffect(() => {
    if (!asking) {
      inputRef.current?.focus();
    }
  }, [asking]);

  // Makes the browser's back button return to the home screen instead of
  // leaving the site. We push one history entry when a round starts, so the
  // back button has something to "undo" — popping it just resets local state.
  useEffect(() => {
    function handlePopState() {
      backToMenu();
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startGame(difficulty?: Difficulty) {
    setStatus("starting");
    setError(null);
    setDifficulty(difficulty);
    // Enforces a floor of 2 seconds on this loading screen regardless of how
    // fast the server actually responds, so it reads as a deliberate moment
    // rather than a flicker on a fast connection. Promise.all waits for the
    // slower of the two, it doesn't add them together.
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const fetchPromise = fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(difficulty ? { difficulty } : {}),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not start a new round");
        return data;
      });

      const [data] = await Promise.all([fetchPromise, minDelay]);
      setSessionId(data.session_id);
      setTranscript([]);
      setNoCount(0);
      setTotalQuestions(0);
      setRevealedTitle(null);
      setStatus("active");
      // Adds one entry to browser history marking "in a round" — pressing
      // back will pop this and trigger the popstate handler above.
      window.history.pushState({ screen: "game" }, "", "");
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

  if (booting) {
    return <LoadingScreen label="LOADING PROFESSIONLE" />;
  }
  if (status === "starting") {
    return <LoadingScreen label="SETTING THINGS UP" />;
  }
  if (status === "idle") {
    return <StartScreen onStart={startGame} error={error} />;
  }

  const gameOver = status === "won" || status === "lost";

  return (
    <main className="vignette min-h-screen flex flex-col">
      <header className="border-b border-wire px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={backToMenu} className="shrink-0" aria-label="Back to home">
            <Logo size={32} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-case text-xs tracking-wide text-manila">CASE FILE — OPEN</p>
              <span className="font-case text-[10px] tracking-wide border border-wire rounded px-1.5 py-0.5 text-paperDim uppercase">
                {difficulty ?? "random"}
              </span>
            </div>
            <h1 className="font-case text-xl">Professionle</h1>
          </div>
        </div>
        <button
          onClick={giveUp}
          disabled={gameOver}
          className="font-case text-xs tracking-wide border border-wire px-3 py-2 text-paperDim hover:border-alert hover:text-alert transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          GIVE UP
        </button>
      </header>
      <RiskMeter count={noCount} />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-3 min-h-0">
          {transcript.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
              <Logo size={40} />
              <p className="text-paperDim/70 italic max-w-sm">
                Ask a yes-or-no question to get started, or try one of these:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-sm border border-wire rounded-full px-3 py-1.5 text-paperDim hover:border-manila hover:text-manila transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {transcript.map((entry, i) => (
            <TranscriptRow key={i} entry={entry} />
          ))}
          {asking && <ThinkingIndicator />}
          {gameOver && revealedTitle && (
            <div className="bg-panelLight border border-manila/40 rounded-lg p-5 mt-2">
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

        <aside className="md:w-72 border-t md:border-t-0 md:border-l border-wire px-6 py-6 space-y-5">
          <TallyCounter count={noCount} />
          <div className="border-t border-wire pt-5">
            <p className="font-case text-xs tracking-wide text-paperDim mb-1">QUESTIONS ASKED</p>
            <p className="text-2xl font-case">{totalQuestions}</p>
          </div>
          <div className="border-t border-wire pt-5 text-xs text-paperDim/70 leading-relaxed">
            Hints unlock automatically at 5 and 8 &ldquo;no&rdquo; answers. Ten &ldquo;no&rdquo;
            answers and the case goes cold — guess the exact title any time to close it early.
          </div>
        </aside>
      </div>

      {error && <p className="px-6 py-2 text-alert text-sm">{error}</p>}

      <form onSubmit={ask} className="border-t border-wire p-4 flex gap-3">
        <input
          ref={inputRef}
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

const STARTER_QUESTIONS = [
  "Do you work indoors?",
  "Is it a creative job?",
  "Would I need a degree for this?",
];

const MAX_NOS = 10;

function RiskMeter({ count }: { count: number }) {
  const pct = Math.min(100, (count / MAX_NOS) * 100);
  const danger = count >= 8;
  return (
    <div className="w-full h-1.5 bg-wire/30">
      <div
        className={`h-full transition-all duration-500 ease-out ${danger ? "bg-alert" : "bg-manila"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TranscriptRow({ entry }: { entry: TranscriptEntry }) {
  if (entry.kind === "hint") {
    return (
      <div className="border border-manila/50 bg-panelLight rounded-lg px-4 py-3">
        <p className="font-case text-xs text-manila mb-1">
          CASE NOTE — UNLOCKED AT {entry.level} NOS
        </p>
        <p className="text-paper/90">{entry.text}</p>
      </div>
    );
  }
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
      <span
        className={`stamp shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[entry.answer]}`}
      >
        {ANSWER_LABEL[entry.answer]}
      </span>
    </div>
  );
}

const DIFFICULTIES: { key: Difficulty; label: string; blurb: string }[] = [
  { key: "easy", label: "Easy", blurb: "Everyday jobs almost everyone recognizes." },
  { key: "medium", label: "Medium", blurb: "Takes a few follow-up questions to pin down." },
  { key: "hard", label: "Hard", blurb: "Specialist roles — sharper questions needed." },
];

const SAMPLE_EXCHANGE: { question: string; answer: Answer }[] = [
  { question: "Do you work outdoors?", answer: "no" },
  { question: "Is it a creative job?", answer: "yes" },
  { question: "Would I need a degree?", answer: "sometimes" },
];

function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="vignette min-h-screen flex flex-col items-center justify-center px-6 enter">
      <div className="logo-pulse mb-6">
        <Logo size={72} />
      </div>
      <p className="font-case text-sm tracking-wide text-paperDim mb-3">{label}</p>
      <span className="flex gap-1.5">
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
      </span>
    </main>
  );
}

function StartScreen({
  onStart,
  error,
}: {
  onStart: (difficulty?: Difficulty) => void;
  error: string | null;
}) {
  return (
    <main className="vignette min-h-screen flex items-center justify-center px-6 py-12">
      <div className="enter w-full max-w-4xl grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <Logo size={48} />
          <h1 className="font-case text-4xl md:text-5xl leading-tight mb-4 mt-3">Professionle</h1>
          <p className="text-paperDim text-lg leading-relaxed mb-8 max-w-sm">
            Someone's been assigned a job. Ask yes-or-no questions until you work out what it is.
          </p>

          <div className="space-y-2 mb-4">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                onClick={() => onStart(d.key)}
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

          <button
            onClick={() => onStart()}
            className="text-paperDim text-sm underline decoration-wire underline-offset-4 hover:text-manila hover:decoration-manila transition-colors"
          >
            Or pick a random difficulty
          </button>

          <div className="mt-3">
            <Link
              href="/special-cases"
              className="text-paperDim text-sm underline decoration-wire underline-offset-4 hover:text-manila hover:decoration-manila transition-colors"
            >
              Special Cases <span className="font-sans">→</span>
            </Link>
          </div>

          {error && <p className="text-alert text-sm mt-4">{error}</p>}
        </div>

        <div className="bg-panel border border-wire rounded-lg p-6 space-y-4">
          <p className="font-case text-xs tracking-wide text-paperDim mb-2">A ROUND MIGHT LOOK LIKE THIS</p>
          {SAMPLE_EXCHANGE.map((row, i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <p className="text-paper/80 italic flex-1">&ldquo;{row.question}&rdquo;</p>
              <span
                className={`stamp shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[row.answer]}`}
              >
                {ANSWER_LABEL[row.answer]}
              </span>
            </div>
          ))}
          <p className="text-paperDim/70 text-sm pt-2 border-t border-wire">
            Ten wrong answers and the round ends. Two hints unlock automatically along the way.
          </p>
        </div>
      </div>
    </main>
  );
}