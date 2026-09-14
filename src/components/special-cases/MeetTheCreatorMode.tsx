"use client";

import { useEffect, useRef, useState } from "react";
import { TallyCounter } from "@/components/TallyCounter";
import { CREATOR_INFO } from "./creatorInfo";
import type { Answer } from "@/types";

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

const MAX_NOS = 10;

type Status = "idle" | "starting" | "active" | "won" | "lost" | "skipped";

export function MeetTheCreatorMode() {
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

  async function startRound() {
    setStatus("starting");
    setError(null);
    try {
      const res = await fetch("/api/creator/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start Meet the Creator");
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

  if (status === "idle") {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="enter w-full max-w-md text-center">
          <p className="font-case text-xs tracking-wide text-manila mb-3">
            MODE — MEET THE CREATOR
          </p>
          <h2 className="font-case text-2xl mb-4">
            Ask about the person behind Professionle.
          </h2>
          <p className="text-paperDim leading-relaxed mb-8">
            Same yes-or-no format as the main game — except this time the
            &ldquo;case file&rdquo; is the creator, and you know that going in.
            Ask enough questions and their full profile unlocks at the end.
          </p>
          <button
            onClick={startRound}
            className="font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors"
          >
            START
          </button>
          <div className="mt-4">
            <button
              onClick={() => setStatus("skipped")}
              className="font-case text-xs text-paperDim underline decoration-wire underline-offset-4 hover:text-manila hover:decoration-manila transition-colors"
            >
              Not in the mood to play — just show me
            </button>
          </div>
          {error && <p className="text-alert text-sm mt-4">{error}</p>}
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

  if (status === "skipped") {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="enter w-full max-w-md">
          <CreatorRevealCard
            eyebrow="SKIPPED AHEAD"
            intro={
              <p className="text-paper/90 leading-relaxed">
                Fair enough — though it might&apos;ve been fun to watch you take a guess or two
                first. Here&apos;s the file anyway:
              </p>
            }
          />
        </div>
      </div>
    );
  }

  const gameOver = status === "won" || status === "lost";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-3 min-h-0">
        {transcript.length === 0 && (
          <p className="text-paperDim/70 italic text-center py-8">
            Ask a yes-or-no question about the creator to get started.
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
          <CreatorRevealCard
            eyebrow={status === "won" ? "CASE CLOSED — CORRECT" : "CASE CLOSED"}
            intro={
              revealedTitle && (
                <p className="text-xl">
                  It was: <span className="font-semibold text-paper">{revealedTitle}</span>
                </p>
              )
            }
          />
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

function CreatorRevealCard({ eyebrow, intro }: { eyebrow: string; intro: React.ReactNode }) {
  return (
    <div className="bg-panelLight border border-manila/40 rounded-lg p-5 space-y-4">
      <div>
        <p className="font-case text-manila text-sm mb-1">{eyebrow}</p>
        {intro}
      </div>

      <div className="border-t border-wire pt-4">
        <p className="font-case text-lg text-paper">{CREATOR_INFO.name}</p>
        <p className="text-paperDim text-sm mb-3">{CREATOR_INFO.tagline}</p>
        <p className="text-paper/90 mb-4">{CREATOR_INFO.summary}</p>

        <p className="font-case text-xs tracking-wide text-paperDim mb-2">HIGHLIGHTS</p>
        <ul className="space-y-1.5 mb-4">
          {CREATOR_INFO.highlights.map((h, i) => (
            <li key={i} className="text-paper/80 text-sm flex gap-2">
              <span className="text-manila">—</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <p className="font-case text-xs tracking-wide text-paperDim mb-1">EDUCATION</p>
        <p className="text-paper/80 text-sm mb-4">{CREATOR_INFO.education}</p>

        <p className="font-case text-xs tracking-wide text-paperDim mb-2">TOP SKILLS</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {CREATOR_INFO.topSkills.map((skill) => (
            <span
              key={skill}
              className="text-xs border border-wire rounded-full px-3 py-1 text-paperDim"
            >
              {skill}
            </span>
          ))}
        </div>

        {CREATOR_INFO.links.some((l) => l.url) && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-wire">
            {CREATOR_INFO.links
              .filter((l) => l.url)
              .map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-case text-xs text-manila underline underline-offset-4 hover:text-manilaDeep"
                >
                  {l.label} →
                </a>
              ))}
          </div>
        )}
      </div>
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
      <span className={`stamp shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[entry.answer]}`}>
        {ANSWER_LABEL[entry.answer]}
      </span>
    </div>
  );
}