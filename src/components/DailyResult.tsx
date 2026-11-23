"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCountdown } from "@/components/Countdown";
import { formatCountdown } from "@/lib/dailyFormat";

interface Props {
  number: number | null;
  won: boolean;
  title: string;
  score: number;
  hintsTaken: number;
  totalQuestions: number;
  stats: { streak: number; best: number; played: number; average: number | null };
  shareText: string;
  nextAt: string;
  onPractice: () => void;
  onNewCase: () => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the older method
  }
  try {
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(box);
    return ok;
  } catch {
    return false;
  }
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-wire bg-panel/60 px-3 py-2 text-center">
      <p className="font-case text-xl text-paper">{value}</p>
      <p className="font-case text-[10px] uppercase tracking-wide text-paperDim">{label}</p>
    </div>
  );
}

/** The panel shown once today's round is over: job reveal, score, streak, share and the countdown. */
export function DailyResult(p: Props) {
  const [canShare, setCanShare] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ms = useCountdown(p.nextAt);
  const newCaseReady = ms !== null && ms <= 0;

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function flash(next: "copied" | "failed") {
    setFeedback(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeedback("idle"), 2500);
  }

  async function copy() {
    flash((await copyText(p.shareText)) ? "copied" : "failed");
  }

  async function share() {
    try {
      await navigator.share({ text: p.shareText });
    } catch (err) {
      // Closing the share sheet is not an error. Anything else falls back to copying.
      if ((err as { name?: string } | null)?.name !== "AbortError") await copy();
    }
  }

  return (
    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-case text-sm text-manila">{p.won ? "CASE CLOSED · SOLVED" : "CASE WENT COLD"}</p>
        {p.number && <p className="font-case text-xs tracking-wide text-paperDim">DAILY No. {p.number}</p>}
      </div>

      <p className="mt-1 text-2xl">
        The job was: <span className="font-semibold text-paper">{p.title}</span>
      </p>

      <div className="mt-4 flex items-end gap-3">
        <p className="font-case text-5xl leading-none text-paper">{p.score}</p>
        <div className="pb-1">
          <p className="font-case text-sm text-paperDim">/ 100</p>
          <p className="text-xs text-paperDim/80">
            {p.totalQuestions} {p.totalQuestions === 1 ? "question" : "questions"} · {p.hintsTaken}{" "}
            {p.hintsTaken === 1 ? "hint" : "hints"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Figure label="Streak" value={String(p.stats.streak)} />
        <Figure label="Best streak" value={String(p.stats.best)} />
        <Figure label="Played" value={String(p.stats.played)} />
        <Figure label="Avg questions" value={p.stats.average === null ? "-" : String(p.stats.average)} />
      </div>

      <pre className="mt-4 whitespace-pre-wrap rounded border border-wire bg-ink/60 p-3 font-body text-sm leading-relaxed text-paper/90">
        {p.shareText}
      </pre>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="border border-manila px-4 py-2 font-case text-sm text-manila transition-colors hover:bg-manila hover:text-ink"
        >
          COPY RESULT
        </button>
        {canShare && (
          <button
            type="button"
            onClick={share}
            className="border border-wire px-4 py-2 font-case text-sm text-paperDim transition-colors hover:border-manila hover:text-manila"
          >
            SHARE
          </button>
        )}
        <span role="status" aria-live="polite" className="text-sm text-paperDim">
          {feedback === "copied" && "Copied. Paste it anywhere."}
          {feedback === "failed" && "Could not copy. Select the text above instead."}
        </span>
      </div>

      <div className="mt-5 border-t border-wire pt-4">
        {newCaseReady ? (
          <button
            type="button"
            onClick={p.onNewCase}
            className="border-2 border-manila px-4 py-2 font-case text-sm text-manila transition-colors hover:bg-manila hover:text-ink"
          >
            A NEW CASE IS READY. PLAY IT
          </button>
        ) : (
          <p className="font-case text-sm text-paperDim">
            NEXT CASE IN <span className="text-paper">{ms === null ? "--:--:--" : formatCountdown(ms)}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={p.onPractice}
          className="border border-wire px-4 py-2 font-case text-sm text-paperDim transition-colors hover:border-manila hover:text-manila"
        >
          PRACTICE
        </button>
        <Link
          href="/special-cases"
          className="border border-wire px-4 py-2 font-case text-sm text-paperDim transition-colors hover:border-manila hover:text-manila"
        >
          SPECIAL CASES →
        </Link>
      </div>
    </div>
  );
}