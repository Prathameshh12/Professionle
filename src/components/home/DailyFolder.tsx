"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Countdown } from "@/components/Countdown";
import type { DailyHome } from "@/lib/dailyStorage";

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@?";
const MAX_NOS = 10;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function randomText(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
  return out;
}

const CTA_LABEL: Record<DailyHome["phase"], string> = {
  new: "Guess today's job",
  resume: "Keep guessing",
  done: "View result",
};

/** The job title, blacked out. Hover (or tap) the bars and they scramble, then say ACCESS DENIED. */
function Redacted() {
  const [words, setWords] = useState<[string, string]>(["", ""]);
  const [active, setActive] = useState(false);
  const busy = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  async function decode() {
    if (busy.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    busy.current = true;
    setActive(true);
    for (let frame = 0; frame < 16 && alive.current; frame++) {
      setWords([randomText(8), randomText(5)]);
      await wait(55);
    }
    if (alive.current) {
      setWords(["ACCESS", "DENIED"]);
      await wait(750);
    }
    if (alive.current) {
      setWords(["", ""]);
      setActive(false);
    }
    busy.current = false;
  }

  return (
    <div className="hp-redacted" role="img" aria-label="Hidden job title" onPointerEnter={decode}>
      <span className={`hp-bar${active ? " hp-scr" : ""}`} style={{ width: 116 }} aria-hidden="true">
        {words[0]}
      </span>
      <span className={`hp-bar${active ? " hp-scr" : ""}`} style={{ width: 82 }} aria-hidden="true">
        {words[1]}
      </span>
    </div>
  );
}

function CountUp({ to }: { to: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    function step(now: number) {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{value}</>;
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function DailyFolder({
  daily,
  onStartDaily,
  onDayRolled,
  error,
}: {
  daily: DailyHome;
  onStartDaily: () => void;
  onDayRolled: () => void;
  error: string | null;
}) {
  const tab = daily.number
    ? `Case No. ${daily.number}${daily.dateLabel ? ` · ${daily.dateLabel}` : ""}`
    : "Today's case";
  const questions = daily.totalQuestions ?? 0;
  const nos = daily.noCount ?? 0;

  return (
    <section className="hp-wrap" id="daily">
      <div className="hp-folder">
        <div className="hp-ftab font-case">{tab}</div>
        <div className="hp-fbody">
          <div>
            {daily.phase === "done" ? (
              <>
                <p className={`hp-lbl font-case ${daily.status === "won" ? "hp-ok" : "hp-bad"}`}>
                  {daily.status === "won" ? "Case solved" : "Case went cold"}
                </p>
                <p className="hp-score font-case">
                  <CountUp to={daily.score ?? 0} />
                  <small>/ 100</small>
                </p>
                {daily.squares && daily.squares.length > 0 && (
                  <div className="hp-squares" aria-hidden="true">
                    {daily.squares.map((c, i) => (
                      <i key={i} className={`hp-sq-${c}`} style={{ "--i": i } as CSSProperties} />
                    ))}
                  </div>
                )}
                <p className="hp-meta">
                  {plural(questions, "question", "questions")}, {plural(nos, "no", "nos")}
                </p>
              </>
            ) : (
              <>
                <p className="hp-lbl font-case">{daily.phase === "resume" ? "In progress" : "The mystery job"}</p>
                <Redacted />
                {daily.phase === "resume" ? (
                  <>
                    <p className="hp-meta">
                      {plural(questions, "question", "questions")} asked, {plural(nos, "no", "nos")}
                    </p>
                    <div className={`hp-meter${nos >= 8 ? " hp-danger" : ""}`} aria-hidden="true">
                      {Array.from({ length: MAX_NOS }, (_, i) => (
                        <i key={i} className={i < nos ? "hp-on" : ""} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="hp-meta">Go on, try to read the black bars.</p>
                )}
              </>
            )}
          </div>

          <div className="hp-side">
            {daily.nextAt && (
              <div className="hp-next font-case">
                Next job in <Countdown nextAt={daily.nextAt} onDone={onDayRolled} className="hp-count" />
              </div>
            )}
          </div>
        </div>
      </div>

      <button type="button" className="hp-cta" onClick={onStartDaily}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </svg>
        <span>{CTA_LABEL[daily.phase]}</span>
      </button>

      {daily.phase !== "done" && (
        <p className="hp-rules font-case">10 nos and you&apos;re out · hints drop along the way</p>
      )}

      {error && (
        <p role="alert" className="hp-error">
          {error}
        </p>
      )}
    </section>
  );
}