"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SpecialCasesMenu } from "./SpecialCasesMenu";
import { RoleReversalMode } from "./RoleReversalMode";
import { MeetTheCreatorMode } from "./MeetTheCreatorMode";
import { BlindCaseMode } from "./BlindCaseMode";
import { TwoTruthsMode } from "./TwoTruthsMode";

export type SpecialCaseMode = "role-reversal" | "meet-the-creator" | "blind-case" | "two-truths";

export function SpecialCasesScreen() {
  const [activeMode, setActiveMode] = useState<SpecialCaseMode | null>(null);

  return (
    <main className="vignette min-h-screen flex flex-col">
      <header className="border-b border-wire px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to home" className="shrink-0">
            <Logo size={32} />
          </Link>
          <div>
            <p className="font-case text-xs tracking-wide text-manila">CASE FILE — SPECIAL</p>
            <h1 className="font-case text-xl">Special Cases</h1>
          </div>
        </div>

        {activeMode ? (
          <button
            onClick={() => setActiveMode(null)}
            className="font-case text-xs tracking-wide border border-wire px-3 py-2 text-paperDim hover:border-manila hover:text-manila transition-colors"
          >
            ← BACK TO MODES
          </button>
        ) : (
          <Link
            href="/"
            className="font-case text-xs tracking-wide border border-wire px-3 py-2 text-paperDim hover:border-manila hover:text-manila transition-colors"
          >
            BACK TO MAIN GAME
          </Link>
        )}
      </header>

      <div className="flex-1 min-h-0">
        {activeMode === null && <SpecialCasesMenu onSelect={setActiveMode} />}
        {activeMode === "role-reversal" && <RoleReversalMode />}
        {activeMode === "meet-the-creator" && <MeetTheCreatorMode />}
        {activeMode === "blind-case" && <BlindCaseMode />}
        {activeMode === "two-truths" && <TwoTruthsMode />}
      </div>
    </main>
  );
}