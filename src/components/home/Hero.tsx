"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { ANSWER_COLOR, ANSWER_LABEL } from "@/lib/answerStyle";
import type { Answer } from "@/types";
import { useLightRig } from "./useLightRig";

const WORD = "Professionle";
const WRONG_GUESSES = [
  "surgeon",
  "plumber",
  "pilot",
  "baker",
  "detective",
  "electrician",
  "florist",
  "paramedic",
  "architect",
  "DJ",
];
const POKE_ANSWERS: Answer[] = [
  "yes",
  "no",
  "sometimes",
  "not_really",
  "no",
  "yes",
];

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function Hero({
  pageRef,
  children,
}: {
  pageRef: RefObject<HTMLElement>;
  children?: ReactNode;
}) {
  const lampRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLButtonElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [typed, setTyped] = useState("");
  const [struck, setStruck] = useState(false);
  const [pokes, setPokes] = useState(0);

  useLightRig(pageRef, lampRef, figureRef, headRef);

  // Types out a wrong guess, strikes it through, deletes it, then tries the next one.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped("plumber");
      return;
    }
    let cancelled = false;
    (async () => {
      let i = 0;
      while (!cancelled) {
        const word = WRONG_GUESSES[i % WRONG_GUESSES.length];
        i += 1;
        for (let k = 1; k <= word.length && !cancelled; k++) {
          setTyped(word.slice(0, k));
          await wait(75);
        }
        await wait(500);
        if (cancelled) return;
        setStruck(true);
        await wait(1000);
        if (cancelled) return;
        setStruck(false);
        for (let k = word.length; k >= 0 && !cancelled; k--) {
          setTyped(word.slice(0, k));
          await wait(35);
        }
        await wait(250);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Every few seconds one letter of the title flickers like a bad bulb.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const letters = titleRef.current?.querySelectorAll<HTMLElement>(".hp-ch");
      if (!letters || letters.length === 0) return;
      const el = letters[Math.floor(Math.random() * letters.length)];
      el.classList.remove("hp-flick");
      void el.offsetWidth; // restart the animation
      el.classList.add("hp-flick");
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const answer =
    pokes > 0 ? POKE_ANSWERS[(pokes - 1) % POKE_ANSWERS.length] : null;

  return (
    <>
      <section className="hp-hero">
        <div className="hp-lamp-lean" ref={lampRef} aria-hidden="true">
          <div className="hp-lamp-swing">
            <div className="hp-cord" />
            <div className="hp-shade" />
            <div className="hp-bulb" />
            <div className="hp-cone" />
          </div>
        </div>

        <div className="hp-hero-text">
          <h1 className="hp-title font-case" ref={titleRef} aria-label={WORD}>
            {WORD.split("").map((c, i) => (
              <span
                key={i}
                className="hp-ch"
                style={{ "--i": i } as CSSProperties}
                aria-hidden="true"
              >
                {c}
              </span>
            ))}
          </h1>
          <p className="hp-kicker font-case">Guess the job</p>
          <p className="hp-sub font-case">
            A new mystery job every day. Ask yes-or-no questions to figure it
            out.
          </p>
          <p className="hp-guesses font-case" aria-hidden="true">
            Is it a{" "}
            <span className={`hp-typed${struck ? " hp-struck" : ""}`}>
              {typed}
            </span>
            <span className="hp-caret" />?
          </p>
        </div>
      </section>

      {children}

      <div className="hp-suspect">
        <div className="hp-fig-stamp" aria-live="polite">
          {answer && (
            <span
              key={pokes}
              className={`hp-ans hp-slam font-case ${ANSWER_COLOR[answer]}`}
            >
              {ANSWER_LABEL[answer]}
            </span>
          )}
        </div>
        <button
          type="button"
          ref={figureRef}
          className="hp-figure"
          aria-label="Poke the mystery figure for a yes or no answer"
          onClick={() => setPokes((n) => n + 1)}
        >
          <svg viewBox="0 0 100 150" aria-hidden="true">
            <text
              className="hp-q font-case"
              x="50"
              y="32"
              textAnchor="middle"
              fontSize="36"
              fill="#C9A876"
            >
              ?
            </text>
            <g ref={headRef}>
              <circle
                cx="50"
                cy="64"
                r="14"
                fill="#07090d"
                stroke="rgba(243,226,184,.35)"
                strokeWidth="1"
              />
            </g>
            <path
              d="M14 150C14 108 30 92 50 92c20 0 36 16 36 58z"
              fill="#07090d"
              stroke="rgba(243,226,184,.3)"
              strokeWidth="1"
            />
          </svg>
        </button>
        <p className="hp-fig-hint font-case">
          <b>Poke the suspect</b>It only says yes or no.
        </p>
      </div>
    </>
  );
}