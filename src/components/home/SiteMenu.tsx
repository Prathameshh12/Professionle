"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { n: "01", id: "daily", title: "Today's case", desc: "The daily mystery job" },
  { n: "02", id: "practice", title: "Practice rounds", desc: "Easy, medium, hard or random" },
  { n: "03", id: "special", title: "Special cases", desc: "Four twists on the usual round" },
  { n: "04", id: "demo", title: "How it plays", desc: "Try a sample round" },
];

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const hasOpened = useRef(false);

  // Move focus into the drawer when it opens, and back to the button when it closes.
  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      drawerRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (hasOpened.current) btnRef.current?.focus({ preventScroll: true });
  }, [open]);

  function goTo(id: string) {
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className="hp-menu-btn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="hp-drawer"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="hp-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>

      <div className={`hp-scrim${open ? " hp-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside
        id="hp-drawer"
        ref={drawerRef}
        className={`hp-drawer${open ? " hp-open" : ""}`}
        aria-label="Site menu"
        aria-hidden={!open}
      >
        <p className="hp-drawer-title font-case">Case index</p>
        <nav className="hp-drawer-nav font-case">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                goTo(s.id);
              }}
            >
              <span className="hp-dn-n">{s.n}</span>
              <span>
                <span className="hp-dn-t">{s.title}</span>
                <span className="hp-dn-d">{s.desc}</span>
              </span>
            </a>
          ))}
          <Link href="/faq" onClick={() => setOpen(false)}>
            <span className="hp-dn-n">05</span>
            <span>
              <span className="hp-dn-t">Rules and FAQ</span>
              <span className="hp-dn-d">Hints, scoring and the daily reset</span>
            </span>
          </Link>
        </nav>
        <p className="hp-drawer-foot font-case">
          10 nos and you&apos;re out
          <br />A new case every day
        </p>
      </aside>
    </>
  );
}