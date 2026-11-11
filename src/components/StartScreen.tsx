"use client";

import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Spotlight } from "@/components/Spotlight";
import { ANSWER_COLOR, ANSWER_LABEL } from "@/lib/answerStyle";
import type { DailyHome } from "@/lib/dailyStorage";
import type { Answer, Difficulty } from "@/types";

const PRACTICE: { key: Difficulty | undefined; label: string; blurb: string; dashed?: boolean }[] = [
  { key: "easy", label: "Easy", blurb: "Everyday jobs" },
  { key: "medium", label: "Medium", blurb: "A few follow-ups" },
  { key: "hard", label: "Hard", blurb: "Specialist roles" },
  { key: undefined, label: "Random", blurb: "Any difficulty", dashed: true },
];

const SAMPLE_EXCHANGE: { question: string; answer: Answer }[] = [
  { question: "Do you work outdoors?", answer: "no" },
  { question: "Is it a creative job?", answer: "yes" },
  { question: "Would I need a degree?", answer: "sometimes" },
];

const CTA_LABEL: Record<DailyHome["phase"], string> = {
  new: "Guess today's job",
  resume: "Keep guessing",
  done: "View result",
};

/** The job title, blacked out like a redacted case file. */
function Redacted() {
  return (
    <div role="img" aria-label="Hidden job title" className="flex items-center gap-3">
      <span className="h-6 w-28 rounded-sm bg-paper/85" />
      <span className="h-6 w-20 rounded-sm bg-paper/85" />
    </div>
  );
}

function DailyCard({ daily, onDayRolled }: { daily: DailyHome; onDayRolled: () => void }) {
  const tab = daily.number
    ? `Case No. ${daily.number}${daily.dateLabel ? ` · ${daily.dateLabel}` : ""}`
    : "Today's case";

  return (
    <div className="relative mt-1">
      <div className="absolute -top-[13px] left-5 bg-manila px-3 py-1 font-case text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b0e13]">
        {tab}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-2 border-manila bg-[#11151c] px-5 pb-5 pt-7">
        <div className="flex flex-col gap-2">
          {daily.phase === "done" ? (
            <>
              <p className="font-case text-xs uppercase tracking-[0.18em] text-paperDim">
                {daily.status === "won" ? "Case solved" : "Case went cold"}
              </p>
              <p className="font-case text-2xl font-bold leading-tight text-paper">
                {daily.score ?? 0}
                <span className="text-base font-normal text-paperDim"> / 100</span>
              </p>
            </>
          ) : (
            <>
              <p className="font-case text-xs uppercase tracking-[0.18em] text-paperDim">
                {daily.phase === "resume" ? "In progress" : "The mystery job"}
              </p>
              <Redacted />
              {daily.phase === "resume" && (
                <p className="text-sm text-paperDim">
                  {daily.totalQuestions ?? 0} {daily.totalQuestions === 1 ? "question" : "questions"} asked,{" "}
                  {daily.noCount ?? 0} {daily.noCount === 1 ? "no" : "nos"}
                </p>
              )}
            </>
          )}
        </div>
        {daily.nextAt && (
          <div className="flex items-center gap-2.5 text-sm text-paperDim">
            <span aria-hidden="true" className="inline-block h-2 w-2 bg-manila" />
            <span>
              Next job in <Countdown nextAt={daily.nextAt} onDone={onDayRolled} className="font-case text-paper" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StartScreen({
  daily,
  onStartDaily,
  onStart,
  onDayRolled,
  error,
}: {
  daily: DailyHome;
  onStartDaily: () => void;
  onStart: (difficulty?: Difficulty) => void;
  onDayRolled: () => void;
  error: string | null;
}) {
  return (
    <main className="min-h-screen bg-[#0b0e13]">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0d1017] via-[#131824] to-[#0b0e13] px-6 pb-[185px] pt-9 text-center md:pb-[200px] md:pt-12">
        <Spotlight />

        <div className="enter relative z-10">
          <h1 className="font-case text-4xl font-normal leading-none text-paper [text-shadow:1px_1px_0_#4a3f26] sm:text-5xl md:text-6xl">
            Professionle
          </h1>
          <p className="mt-4 pl-[0.35em] font-case text-xs font-bold uppercase tracking-[0.35em] text-manila sm:text-sm md:text-base">
            Guess the job
          </p>
          <p className="mx-auto mt-3 max-w-3xl font-case text-sm leading-relaxed text-paper/90">
            A new mystery job every day. Ask yes-or-no questions to figure it out.
          </p>
          <p className="mx-auto mt-1 max-w-3xl font-case text-xs leading-relaxed text-paperDim">
            10 nos and you&apos;re out · hints drop along the way
          </p>
        </div>
      </section>

      <div className="enter mx-auto flex w-full max-w-[920px] flex-col gap-6 px-6 pb-20 pt-8">
        <DailyCard daily={daily} onDayRolled={onDayRolled} />

        <button
          type="button"
          onClick={onStartDaily}
          className="flex min-h-[60px] w-full items-center justify-center gap-3 border-2 border-manila bg-[#0f131a] font-case text-base font-bold uppercase tracking-[0.14em] text-paper shadow-[0_4px_0_rgba(201,168,118,0.28)] transition hover:bg-[#161c27] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(201,168,118,0.28)] sm:text-lg md:min-h-[68px] md:text-xl md:tracking-[0.18em]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C9A876"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 shrink-0 md:h-6 md:w-6"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5L21 21" />
          </svg>
          <span>{CTA_LABEL[daily.phase]}</span>
        </button>

        {error && (
          <p role="alert" className="text-sm text-alert">
            {error}
          </p>
        )}

        <section className="mt-2 flex flex-col gap-3">
          <p className="font-case text-xs uppercase tracking-[0.18em] text-paperDim">
            Practice rounds · play as many as you like
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {PRACTICE.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onStart(p.key)}
                className={`flex min-h-[68px] flex-col justify-center gap-0.5 border bg-[#0f141c] px-4 py-3 text-left transition-colors hover:border-manila hover:bg-[#161c27] ${
                  p.dashed ? "border-dashed border-[#4a5568]" : "border-[#384255]"
                }`}
              >
                <span className="font-case text-[15px] font-bold uppercase tracking-[0.16em] text-paper">{p.label}</span>
                <span className="text-[13px] text-paperDim">{p.blurb}</span>
              </button>
            ))}
          </div>
          <Link
            href="/special-cases"
            className="flex min-h-[72px] items-center justify-between gap-4 border border-[#384255] bg-[#0f141c] px-5 py-3.5 transition-colors hover:border-manila hover:bg-[#161c27]"
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-case text-[15px] font-bold uppercase tracking-[0.16em] text-manila">Special Cases</span>
              <span className="text-sm text-paperDim">Two Truths, Role Reversal and other twists</span>
            </span>
            <span aria-hidden="true" className="font-sans text-xl text-manila">
              →
            </span>
          </Link>
        </section>

        <section className="mt-6 space-y-4 rounded-lg border border-wire bg-panel p-6">
          <p className="mb-2 font-case text-xs tracking-wide text-paperDim">A ROUND MIGHT LOOK LIKE THIS</p>
          {SAMPLE_EXCHANGE.map((row, i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <p className="flex-1 italic text-paper/80">&ldquo;{row.question}&rdquo;</p>
              <span className={`stamp shrink-0 border-2 px-2 py-1 font-case text-xs ${ANSWER_COLOR[row.answer]}`}>
                {ANSWER_LABEL[row.answer]}
              </span>
            </div>
          ))}
          <p className="border-t border-wire pt-2 text-sm text-paperDim/70">
            Ten wrong answers and the round ends. Two hints unlock automatically along the way.
          </p>
        </section>
      </div>
    </main>
  );
}