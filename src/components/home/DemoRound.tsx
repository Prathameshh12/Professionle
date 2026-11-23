"use client";

import { useState } from "react";
import { TallyCounter } from "@/components/TallyCounter";
import { ANSWER_COLOR, ANSWER_LABEL } from "@/lib/answerStyle";
import type { Answer } from "@/types";

// A fixed demo case (a paramedic). Nothing here touches the server or counts toward any score.
const DEMO: { question: string; answer: Answer }[] = [
  { question: "Do you work outdoors?", answer: "sometimes" },
  { question: "Is it a creative job?", answer: "no" },
  { question: "Would I need a degree?", answer: "yes" },
  { question: "Do you wear a uniform?", answer: "yes" },
  { question: "Do you sit at a desk all day?", answer: "no" },
  { question: "Do you help sick or injured people?", answer: "yes" },
  { question: "Do you work alone?", answer: "not_really" },
  { question: "Is it a dangerous job?", answer: "yes" },
];

export function DemoRound() {
  const [asked, setAsked] = useState<number[]>([]);

  const nos = asked.filter((i) => DEMO[i].answer === "no" || DEMO[i].answer === "not_really").length;

  function ask(i: number) {
    setAsked((cur) => (cur.includes(i) ? cur : [...cur, i]));
  }

  return (
    <section className="hp-wrap hp-section" id="demo">
      <p className="hp-eyebrow font-case">Try a round · demo case, no score</p>
      <div className="hp-demo">
        <div className="hp-demo-grid">
          <div className="hp-chips">
            {DEMO.map((d, i) => (
              <button key={d.question} type="button" className="hp-chip" disabled={asked.includes(i)} onClick={() => ask(i)}>
                {d.question}
              </button>
            ))}
          </div>
          <div className="hp-log" aria-live="polite">
            {asked.length === 0 && <p className="hp-empty">Tap a question. The suspect answers yes or no.</p>}
            {asked.map((i) => (
              <div key={i} className="hp-row">
                <p>&ldquo;{DEMO[i].question}&rdquo;</p>
                <span className={`hp-ans hp-slam font-case ${ANSWER_COLOR[DEMO[i].answer]}`}>
                  {ANSWER_LABEL[DEMO[i].answer]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="hp-demo-foot">
          <div>
            <TallyCounter count={nos} />
          </div>
          <button type="button" className="hp-link font-case" onClick={() => setAsked([])}>
            Reset demo
          </button>
        </div>
      </div>
      <p className="hp-note">
        Ten nos and the round ends. Two hints unlock along the way. In the real game you can type the job name at any time.
      </p>
    </section>
  );
}