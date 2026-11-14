"use client";

import Link from "next/link";
import { useRef } from "react";
import { DailyFolder } from "@/components/home/DailyFolder";
import { BuiltBy } from "@/components/home/BuiltBy";
import { DemoRound } from "@/components/home/DemoRound";
import { EvidenceLayer } from "@/components/home/EvidenceLayer";
import { Hero } from "@/components/home/Hero";
import { PracticeFiles } from "@/components/home/PracticeFiles";
import { SiteMenu } from "@/components/home/SiteMenu";
import { SpecialTags } from "@/components/home/SpecialTags";
import type { DailyHome } from "@/lib/dailyStorage";
import type { Difficulty } from "@/types";
import "@/components/home/home.css";

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
  const pageRef = useRef<HTMLElement>(null);

  return (
    <main ref={pageRef} className="hp-page">
      <div className="hp-room" aria-hidden="true" />
      <div className="hp-glow" aria-hidden="true" />
      <EvidenceLayer />
      <SiteMenu />

      <div className="hp-content">
        <div className="hp-top">
          <Hero pageRef={pageRef}>
            <DailyFolder daily={daily} onStartDaily={onStartDaily} onDayRolled={onDayRolled} error={error} />
          </Hero>
        </div>
        <PracticeFiles onStart={onStart} />
        <SpecialTags />
        <DemoRound />
        <BuiltBy />
        <footer className="hp-footer font-case">
          A new case every day · <Link href="/faq">FAQ</Link> · <Link href="/about">About</Link>
        </footer>
      </div>
    </main>
  );
}