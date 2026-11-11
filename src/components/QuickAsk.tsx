"use client";

import { useState } from "react";
import { ANSWER_LABEL } from "@/lib/answerStyle";
import type { TranscriptEntry } from "@/lib/dailyScore";
import { QUICK_GROUPS, findAnswer } from "@/lib/quickQuestions";

type Props = {
  transcript: TranscriptEntry[];
  /** Index of the selected topic tab. Kept by the parent so it survives the layout change. */
  tab: number;
  onTab: (index: number) => void;
  /** Called with the question text when a chip is tapped. */
  onPick: (question: string) => void;
  disabled: boolean;
  /** "center" is the wrapped layout for an empty chat. "bar" is the slim scrolling strip above the input. */
  layout: "center" | "bar";
};

const HIDE_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function QuickAsk({ transcript, tab, onTab, onPick, disabled, layout }: Props) {
  const [open, setOpen] = useState(true);
  const group = QUICK_GROUPS[tab] ?? QUICK_GROUPS[0];
  const bar = layout === "bar";

  const tabs = QUICK_GROUPS.map((g, i) => {
    const active = i === tab;
    return (
      <button
        key={g.id}
        type="button"
        onClick={() => onTab(i)}
        aria-pressed={active}
        className={`shrink-0 whitespace-nowrap border-b pb-1 font-case text-xs tracking-wide transition-colors ${
          active ? "border-manila text-manila" : "border-transparent text-paperDim hover:text-paper"
        }`}
      >
        {g.label}
      </button>
    );
  });

  const chips = group.questions.map((q) => {
    const answer = findAnswer(transcript, q);
    const used = answer !== null;
    return (
      <button
        key={q}
        type="button"
        disabled={disabled || used}
        onClick={() => onPick(q)}
        title={used ? `Already asked: ${ANSWER_LABEL[answer]}` : undefined}
        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
          bar ? "shrink-0 whitespace-nowrap" : ""
        } ${
          used
            ? "border-wire/50 text-paperDim/40"
            : "border-wire text-paperDim hover:border-manila hover:text-manila disabled:opacity-40 disabled:hover:border-wire disabled:hover:text-paperDim"
        }`}
      >
        {q}
        {used && <span className="ml-2 font-case text-[10px] tracking-wide">{ANSWER_LABEL[answer]}</span>}
      </button>
    );
  });

  if (!bar) {
    return (
      <div className="w-full max-w-md">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">{tabs}</div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">{chips}</div>
      </div>
    );
  }

  return (
    <div className="border-t border-wire px-4 pt-3">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex gap-5 overflow-x-auto ${HIDE_SCROLLBAR}`}>{tabs}</div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="shrink-0 font-case text-[10px] tracking-wide text-paperDim/70 hover:text-manila"
        >
          {open ? "HIDE" : "SHOW"}
        </button>
      </div>
      {open && <div className={`mt-3 flex gap-2 overflow-x-auto pb-3 ${HIDE_SCROLLBAR}`}>{chips}</div>}
      {!open && <div className="pb-3" />}
    </div>
  );
}