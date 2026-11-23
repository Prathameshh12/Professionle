"use client";

import Link from "next/link";
import { useState } from "react";

const TAGS = [
  { mode: "two-truths", name: "Two Truths", sub: "Pick the right one", blurb: "Two overlapping jobs, one answer." },
  { mode: "role-reversal", name: "Role Reversal", sub: "You answer", blurb: "You think of a job. The system asks the questions." },
  { mode: "meet-the-creator", name: "Meet the Creator", sub: "A very personal file", blurb: "Same format, except the case file is the creator." },
  { mode: "blind-case", name: "Blind Case", sub: "No hints at all", blurb: "Same format, except you get zero hints." },
];

export function SpecialTags() {
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : TAGS[active];

  return (
    <section className="hp-wrap hp-section" id="special">
      <p className="hp-eyebrow font-case">Special cases · twists on the usual round</p>
      <div className="hp-tags">
        {TAGS.map((t, i) => (
          <Link
            key={t.name}
            href={`/special-cases?mode=${t.mode}`}
            className="hp-tag"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
          >
            <span className="hp-tn font-case">{t.name}</span>
            <span className="hp-tk">{t.sub}</span>
          </Link>
        ))}
      </div>
      <p className="hp-tag-blurb">
        {current ? (
          <>
            <b className="font-case">{current.name.toUpperCase()}</b> &nbsp; {current.blurb}
          </>
        ) : (
          "Hover a tag to see how it plays."
        )}
      </p>
    </section>
  );
}