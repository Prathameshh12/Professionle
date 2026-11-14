"use client";

import type { CSSProperties, PointerEvent } from "react";
import type { Difficulty } from "@/types";

const FILES: {
  key: Difficulty | undefined;
  no: string;
  label: string;
  blurb: string;
  level: number;
  tilt: string;
  random?: boolean;
}[] = [
  { key: "easy", no: "FILE 01", label: "Easy", blurb: "Everyday jobs", level: 1, tilt: "-1.4deg" },
  { key: "medium", no: "FILE 02", label: "Medium", blurb: "A few follow-ups", level: 2, tilt: "0.9deg" },
  { key: "hard", no: "FILE 03", label: "Hard", blurb: "Specialist roles", level: 3, tilt: "-0.7deg" },
  { key: undefined, no: "FILE ??", label: "Random", blurb: "Any difficulty", level: 0, tilt: "1.3deg", random: true },
];

function tilt(e: PointerEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", `${((0.5 - py) * 12).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${((px - 0.5) * 14).toFixed(2)}deg`);
  el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
  el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
}

function untilt(e: PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

export function PracticeFiles({ onStart }: { onStart: (difficulty?: Difficulty) => void }) {
  return (
    <section className="hp-wrap hp-section" id="practice">
      <p className="hp-eyebrow font-case">Practice rounds · play as many as you like</p>
      <div className="hp-files">
        {FILES.map((f) => (
          <button
            key={f.label}
            type="button"
            className={`hp-file${f.random ? " hp-rand" : ""}`}
            style={{ "--r": f.tilt } as CSSProperties}
            onPointerMove={tilt}
            onPointerLeave={untilt}
            onClick={() => onStart(f.key)}
          >
            <span className="hp-no font-case">{f.no}</span>
            <span className="hp-nm font-case">{f.label}</span>
            <span className="hp-bl">{f.blurb}</span>
            {f.random ? (
              <svg className="hp-die" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8" cy="8" r="1.2" />
                <circle cx="16" cy="8" r="1.2" />
                <circle cx="12" cy="12" r="1.2" />
                <circle cx="8" cy="16" r="1.2" />
                <circle cx="16" cy="16" r="1.2" />
              </svg>
            ) : (
              <span className="hp-pips" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <i key={n} className={n <= f.level ? "hp-on" : ""} />
                ))}
              </span>
            )}
            <span className="hp-glare" />
          </button>
        ))}
      </div>
    </section>
  );
}