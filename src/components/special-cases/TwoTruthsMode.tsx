"use client";

import { useEffect, useRef, useState } from "react";
import type { Answer } from "@/types";
import type { QuestionHistoryItem } from "@/lib/llm/types";

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

const DEFAULT_MAX_TURNS = 12;
const DEFAULT_MIN_QUESTIONS = 2;

type Status = "idle" | "starting" | "active" | "ended";

export function TwoTruthsMode() {
  const [status, setStatus] = useState<Status>("idle");
  const [roundToken, setRoundToken] = useState<string | null>(null);
  const [jobATitle, setJobATitle] = useState("");
  const [jobBTitle, setJobBTitle] = useState("");
  const [maxTurns, setMaxTurns] = useState(DEFAULT_MAX_TURNS);
  const [minQuestions, setMinQuestions] = useState(DEFAULT_MIN_QUESTIONS);
  const [history, setHistory] = useState<QuestionHistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [guessing, setGuessing] = useState<"A" | "B" | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [targetTitle, setTargetTitle] = useState<string | null>(null);
  const [sharedFactsSummary, setSharedFactsSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, asking]);

  useEffect(() => {
    if (status === "active" && !asking && !guessing) {
      inputRef.current?.focus();
    }
  }, [asking, guessing, status]);

  async function startRound() {
    setStatus("starting");
    setError(null);
    try {
      const res = await fetch("/api/two-truths/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start a Two Truths round");
      setRoundToken(data.round_token);
      setJobATitle(data.job_a_title);
      setJobBTitle(data.job_b_title);
      setMaxTurns(data.max_turns ?? DEFAULT_MAX_TURNS);
      setMinQuestions(data.min_questions ?? DEFAULT_MIN_QUESTIONS);
      setHistory([]);
      setCorrect(null);
      setTargetTitle(null);
      setSharedFactsSummary(null);
      setStatus("active");
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || !roundToken || asking || guessing || status !== "active") return;
    if (history.length >= maxTurns) return;
    setAsking(true);
    setError(null);
    setInput("");
    try {
      const res = await fetch("/api/two-truths/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round_token: roundToken, history, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setHistory((h) => [...h, { question, answer: data.answer }]);
    } catch (err: any) {
      setError(err.message);
      setInput(question);
    } finally {
      setAsking(false);
    }
  }

  async function submitGuess(side: "A" | "B") {
    if (!roundToken || guessing || asking || status !== "active") return;
    if (history.length < minQuestions) return; // guarded by the disabled buttons too, belt and suspenders
    setGuessing(side);
    setError(null);
    try {
      const res = await fetch("/api/two-truths/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round_token: roundToken,
          guess: side,
          question_count: history.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setCorrect(data.correct);
      setTargetTitle(data.target_title);
      setSharedFactsSummary(data.shared_facts_summary);
      setStatus("ended");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuessing(null);
    }
  }

  const atCap = history.length >= maxTurns;
  const canGuess = history.length >= minQuestions;
  const questionsUntilUnlock = Math.max(0, minQuestions - history.length);

  if (status === "idle") {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="enter w-full max-w-md text-center">
          <p className="font-case text-xs tracking-wide text-manila mb-3">MODE — TWO TRUTHS</p>
          <h2 className="font-case text-2xl mb-4">A logic puzzle, not a guessing game.</h2>
          <p className="text-paperDim leading-relaxed mb-8">
            You&apos;ll be told two real, overlapping jobs upfront. One of them is secretly the
            answer. Every question gets a genuinely true answer about it — no hedging, no hints,
            just deduction. You get one guess, and it&apos;s final, so call it once you&apos;re
            actually sure.
          </p>
          <button
            onClick={startRound}
            className="font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors"
          >
            START
          </button>
          {error && <p className="text-alert text-sm mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (status === "starting") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-6">
        <p className="font-case text-sm tracking-wide text-paperDim">DEALING THE CASE</p>
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
      <div className="px-6 pt-4 pb-3 border-b border-wire">
        <p className="font-case text-xs tracking-wide text-paperDim text-center mb-2">
          CHOOSING BETWEEN
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="font-case text-sm border border-manila/50 text-manila px-3 py-1.5 rounded-full">
            {jobATitle}
          </span>
          <span className="font-case text-xs text-paperDim">OR</span>
          <span className="font-case text-sm border border-manila/50 text-manila px-3 py-1.5 rounded-full">
            {jobBTitle}
          </span>
        </div>
        <div className="mt-3 max-w-xs mx-auto">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-case text-[10px] tracking-wide text-paperDim">QUESTIONS</span>
            <span className="font-case text-[10px] text-paperDim">
              {history.length} / {maxTurns}
            </span>
          </div>
          <div className="w-full h-1 bg-wire/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-manila transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, (history.length / maxTurns) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
        {history.length === 0 && (
          <p className="text-paperDim/70 italic text-center py-4">
            Ask a yes-or-no question. Every answer is genuinely true, no fudging.
          </p>
        )}
        {history.map((h, i) => (
          <div
            key={i}
            className="bg-panel/60 border border-wire rounded-lg px-4 py-3 flex items-start justify-between gap-4"
          >
            <p className="text-paper/90 italic flex-1">&ldquo;{h.question}&rdquo;</p>
            <span className={`shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[h.answer]}`}>
              {ANSWER_LABEL[h.answer]}
            </span>
          </div>
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

        {status === "ended" && correct !== null && (
          <div className="bg-panelLight border border-manila/40 rounded-lg p-5 mt-2 space-y-3">
            <p className={`font-case text-sm ${correct ? "text-manila" : "text-alert"}`}>
              {correct ? "CALLED IT" : "NOT QUITE"}
            </p>
            <p className="text-xl">
              It was: <span className="font-semibold text-paper">{targetTitle}</span>
            </p>
            {sharedFactsSummary && (
              <div className="border-t border-wire pt-3">
                <p className="font-case text-xs tracking-wide text-paperDim mb-1">
                  WHAT WAS TRUE THE WHOLE TIME
                </p>
                <p className="text-paper/90 text-sm leading-relaxed">{sharedFactsSummary}</p>
              </div>
            )}
            <button
              onClick={startRound}
              className="font-case text-sm border border-manila text-manila px-4 py-2 hover:bg-manila hover:text-ink transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {error && <p className="px-6 py-2 text-alert text-sm">{error}</p>}

      {status === "active" && (
        <>
          <div className="border-t border-wire px-6 py-3">
            <p className="font-case text-xs tracking-wide text-paperDim mb-2 text-center">
              {!canGuess
                ? `ASK ${questionsUntilUnlock} MORE QUESTION${questionsUntilUnlock === 1 ? "" : "S"} TO UNLOCK YOUR CALL`
                : atCap
                  ? "TIME TO CALL IT"
                  : "READY TO CALL IT? YOU ONLY GET ONE SHOT"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => submitGuess("A")}
                disabled={!canGuess || guessing !== null}
                className="flex-1 font-case text-sm border-2 border-manila text-manila px-3 py-2.5 hover:bg-manila hover:text-ink transition-colors disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-manila"
              >
                {guessing === "A" ? "…" : `IT'S THE ${jobATitle.toUpperCase()}`}
              </button>
              <button
                onClick={() => submitGuess("B")}
                disabled={!canGuess || guessing !== null}
                className="flex-1 font-case text-sm border-2 border-manila text-manila px-3 py-2.5 hover:bg-manila hover:text-ink transition-colors disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-manila"
              >
                {guessing === "B" ? "…" : `IT'S THE ${jobBTitle.toUpperCase()}`}
              </button>
            </div>
          </div>

          <form onSubmit={ask} className="border-t border-wire p-4 flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={atCap || asking || guessing !== null}
              placeholder={atCap ? "No more questions — make the call above" : "Ask a yes/no question…"}
              className="flex-1 bg-panel border border-wire rounded px-4 py-3 text-paper placeholder:text-paperDim/50 focus:border-manila outline-none disabled:opacity-40"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={atCap || asking || guessing !== null || !input.trim()}
              className="font-case px-5 py-3 bg-manila text-ink font-semibold hover:bg-manilaDeep disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              {asking ? "…" : "ASK"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}