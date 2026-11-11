"use client";

import { useEffect, useRef, useState } from "react";
import { DailyResult } from "@/components/DailyResult";
import { QuickAsk } from "@/components/QuickAsk";
import { ResultModal } from "@/components/ResultModal";
import { StartScreen } from "@/components/StartScreen";
import { TallyCounter } from "@/components/TallyCounter";
import { Logo } from "@/components/logo";
import { ANSWER_COLOR, ANSWER_LABEL } from "@/lib/answerStyle";
import { formatPuzzleDate } from "@/lib/dailyFormat";
import { buildShareText, countHints, type TranscriptEntry } from "@/lib/dailyScore";
import {
  averageQuestions,
  buildDailyHome,
  emptyData,
  finishRound,
  loadDaily,
  roundIsToday,
  saveDaily,
  startRound,
  updateRound,
  type DailyData,
  type DailyRound,
  type TodayInfo,
} from "@/lib/dailyStorage";
import type { Difficulty } from "@/types";

type Mode = "practice" | "daily";

/** Reads a JSON reply. Returns null if the server sent something else (like an HTML error page). */
async function readJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function GamePage() {
  const [booting, setBooting] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "won" | "lost">("idle");
  const [mode, setMode] = useState<Mode>("practice");
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [noCount, setNoCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [quickTab, setQuickTab] = useState(0);
  // After a typed question we put the cursor back in the box. After a chip tap we do not on phones, so the keyboard stays away.
  const refocusRef = useRef(true);
  // The server allows one question every 2 seconds. A quick second tap waits its turn instead of failing.
  const nextAskAtRef = useRef(0);
  // The result card pops up when a round ends. Closing it leaves a "Show result" button behind.
  const [resultDismissed, setResultDismissed] = useState(false);
  // True when the round just ended on this screen (so we pause a moment before the pop-up), false when reopened from home.
  const endedLiveRef = useRef(false);

  // Daily mode. `daily` is what is saved in the browser (today's round and the stats).
  // dailyRef always holds the latest copy, so async code never works from a stale one.
  const [daily, setDaily] = useState<DailyData>(emptyData);
  const dailyRef = useRef<DailyData>(daily);
  const [today, setToday] = useState<TodayInfo | null>(null);

  function commitDaily(next: DailyData) {
    dailyRef.current = next;
    setDaily(next);
    saveDaily(next);
  }

  /** Asks the server which puzzle is live. Returns null if it cannot be reached. */
  async function refreshToday(): Promise<TodayInfo | null> {
    try {
      const res = await fetch("/api/daily/today", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const d = await res.json();
      if (typeof d.puzzle_date !== "string" || typeof d.puzzle_number !== "number" || typeof d.next_puzzle_at !== "string") {
        throw new Error("bad shape");
      }
      const info: TodayInfo = { date: d.puzzle_date, number: d.puzzle_number, nextAt: d.next_puzzle_at };
      setToday(info);
      return info;
    } catch {
      setToday(null);
      return null;
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, asking]);

  // Splash screen on first load — purely cosmetic, gives the app a "loading in" feel.
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Reads the saved daily round and asks which puzzle is live, while the splash screen is showing.
  useEffect(() => {
    const saved = loadDaily();
    dailyRef.current = saved;
    setDaily(saved);
    refreshToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refocus the question box the moment it's re-enabled, so typing the next
  // question doesn't require clicking back into it every single time.
  useEffect(() => {
    if (!asking && refocusRef.current) {
      inputRef.current?.focus();
    }
  }, [asking]);

  // Makes the browser's back button return to the home screen instead of
  // leaving the site. We push one history entry when a round starts, so the
  // back button has something to "undo" — popping it just resets local state.
  useEffect(() => {
    function handlePopState() {
      backToMenu();
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startGame(difficulty?: Difficulty) {
    setResultDismissed(false);
    endedLiveRef.current = false;
    setMode("practice");
    setStatus("starting");
    setError(null);
    setDifficulty(difficulty);
    // Enforces a floor of 2 seconds on this loading screen regardless of how
    // fast the server actually responds, so it reads as a deliberate moment
    // rather than a flicker on a fast connection. Promise.all waits for the
    // slower of the two, it doesn't add them together.
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const fetchPromise = fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(difficulty ? { difficulty } : {}),
      }).then(async (res) => {
        const data = await readJson(res);
        if (!res.ok || !data) throw new Error(data?.error ?? "Could not start a new round. Please try again.");
        return data;
      });

      const [data] = await Promise.all([fetchPromise, minDelay]);
      setSessionId(data.session_id);
      setTranscript([]);
      setNoCount(0);
      setTotalQuestions(0);
      setRevealedTitle(null);
      setStatus("active");
      // Adds one entry to browser history marking "in a round" — pressing
      // back will pop this and trigger the popstate handler above.
      window.history.pushState({ screen: "game" }, "", "");
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  }

  /** Puts a saved daily round on screen. */
  function showDailyRound(round: DailyRound) {
    setResultDismissed(false);
    endedLiveRef.current = false;
    setMode("daily");
    setDifficulty(undefined);
    setSessionId(round.sessionId);
    setTranscript(round.transcript);
    setNoCount(round.noCount);
    setTotalQuestions(round.totalQuestions);
    setRevealedTitle(round.revealedTitle);
    setError(null);
    setStatus(round.status);
    window.history.pushState({ screen: "game" }, "", "");
  }

  /** Ends today's round and adds it to the stats. Safe to call twice. */
  function finishDaily(
    finalStatus: "won" | "lost",
    title: string | null,
    entries: TranscriptEntry[],
    nos: number,
    total: number
  ) {
    commitDaily(
      finishRound(dailyRef.current, {
        status: finalStatus,
        transcript: entries,
        noCount: nos,
        totalQuestions: total,
        revealedTitle: title,
      })
    );
  }

  /** Re-checks a saved, unfinished round against the server. */
  async function syncDailyRound(round: DailyRound) {
    try {
      const res = await fetch(`/api/session/${round.sessionId}/state`, { cache: "no-store" });
      if (res.status === 404) {
        // The server no longer knows this round, so it cannot be continued. Start clean.
        commitDaily({ ...dailyRef.current, round: null });
        backToMenu();
        setError("That round could not be found, so it was reset. Start today's case again.");
        return;
      }
      if (!res.ok) return;
      const s = await res.json();
      if (s.status === "won" || s.status === "lost") {
        setRevealedTitle(s.revealed_title ?? null);
        setNoCount(s.no_count);
        setTotalQuestions(s.total_questions);
        setStatus(s.status);
        finishDaily(s.status, s.revealed_title ?? null, round.transcript, s.no_count, s.total_questions);
      } else if (typeof s.no_count === "number" && typeof s.total_questions === "number") {
        setNoCount(s.no_count);
        setTotalQuestions(s.total_questions);
        commitDaily(
          updateRound(dailyRef.current, {
            transcript: round.transcript,
            noCount: s.no_count,
            totalQuestions: s.total_questions,
          })
        );
      }
    } catch {
      // Offline or a server hiccup: carry on with what is saved on this device.
    }
  }

  /**
   * Opens today's puzzle. If it is already finished, shows the result. If it is half played,
   * carries on from where it stopped. Otherwise starts a fresh round on the server.
   */
  async function startDaily(todayOverride?: TodayInfo | null) {
    setError(null);
    const live = todayOverride !== undefined ? todayOverride : today;
    const saved = dailyRef.current.round;

    if (saved && roundIsToday(saved, live, Date.now())) {
      showDailyRound(saved);
      if (saved.status === "active") await syncDailyRound(saved);
      return;
    }

    setMode("daily");
    setStatus("starting");
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const fetchPromise = fetch("/api/daily/start", { method: "POST" }).then(async (res) => {
        const data = await readJson(res);
        if (!res.ok || !data) throw new Error(data?.error ?? "Could not open today's case. Please try again.");
        return data;
      });
      const [data] = await Promise.all([fetchPromise, minDelay]);
      if (
        typeof data.session_id !== "string" ||
        typeof data.puzzle_date !== "string" ||
        typeof data.puzzle_number !== "number" ||
        typeof data.next_puzzle_at !== "string"
      ) {
        throw new Error("Could not open today's case");
      }
      const info: TodayInfo = { date: data.puzzle_date, number: data.puzzle_number, nextAt: data.next_puzzle_at };
      setToday(info);
      const next = startRound(dailyRef.current, {
        date: info.date,
        number: info.number,
        nextAt: info.nextAt,
        sessionId: data.session_id,
      });
      commitDaily(next);
      if (next.round) showDailyRound(next.round);
    } catch (err: any) {
      setError(err.message ?? "Could not open today's case");
      setMode("practice");
      setStatus("idle");
    }
  }

  /** Called when the countdown reaches zero: find out which puzzle is live now. */
  async function startNewCase() {
    const live = await refreshToday();
    await startDaily(live);
  }

  function ask(e: React.FormEvent) {
    e.preventDefault();
    submitQuestion(input, false);
  }

  /** Sends one question. Used by the text box and by the tap-to-ask chips. */
  async function submitQuestion(raw: string, fromChip: boolean) {
    const question = raw.trim();
    if (!question || !sessionId || asking || status !== "active") return;
    const typed = !fromChip || question === input.trim();
    refocusRef.current =
      !fromChip || (typeof window.matchMedia === "function" && window.matchMedia("(pointer: fine)").matches);
    setAsking(true);
    setError(null);
    if (typed) setInput("");
    try {
      const wait = nextAskAtRef.current - Date.now();
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      nextAskAtRef.current = Date.now() + 2100;
      const res = await fetch(`/api/session/${sessionId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await readJson(res);
      if (!res.ok || !data) throw new Error(data?.error ?? "Something went wrong. Please try again.");

      const added: TranscriptEntry[] = [];
      if (data.wrong_guess) {
        added.push({ kind: "wrong_guess", question });
      } else if (data.is_correct_guess) {
        added.push({ kind: "qa", question, answer: "yes" });
      } else if (data.answer) {
        added.push({ kind: "qa", question, answer: data.answer });
        if (data.hint) {
          const level = data.no_count >= 8 ? 8 : 5;
          added.push({ kind: "hint", level, text: data.hint });
        }
      }
      const nextTranscript = [...transcript, ...added];
      setTranscript(nextTranscript);

      setNoCount(data.no_count);
      setTotalQuestions(data.total_questions);
      if (data.revealed_title) setRevealedTitle(data.revealed_title);
      if (data.status === "won" || data.status === "lost") endedLiveRef.current = true;
      setStatus(data.status);

      if (mode === "daily") {
        if (data.status === "won" || data.status === "lost") {
          finishDaily(data.status, data.revealed_title ?? null, nextTranscript, data.no_count, data.total_questions);
        } else {
          commitDaily(
            updateRound(dailyRef.current, {
              transcript: nextTranscript,
              noCount: data.no_count,
              totalQuestions: data.total_questions,
            })
          );
        }
      }
    } catch (err: any) {
      setError(err.message);
      setInput((cur) => cur || question);
    } finally {
      setAsking(false);
    }
  }

  async function giveUp() {
    if (!sessionId || status !== "active") return;
    if (mode === "daily" && !window.confirm("Give up on today's case? You only get one try each day.")) return;
    const res = await fetch(`/api/session/${sessionId}/give-up`, { method: "POST" });
    const data = await readJson(res);
    if (res.ok && data) {
      setRevealedTitle(data.revealed_title);
      endedLiveRef.current = true;
      setStatus(data.status);
      if (mode === "daily") {
        finishDaily("lost", data.revealed_title ?? null, transcript, noCount, totalQuestions);
      }
    }
  }

  /** Sends the player back to the difficulty-select screen instead of starting a new game directly. */
  function backToMenu() {
    setResultDismissed(false);
    endedLiveRef.current = false;
    setMode("practice");
    setSessionId(null);
    setStatus("idle");
    setTranscript([]);
    setNoCount(0);
    setTotalQuestions(0);
    setRevealedTitle(null);
    setError(null);
  }

  if (booting) {
    return <LoadingScreen label="LOADING PROFESSIONLE" />;
  }
  if (status === "starting") {
    return <LoadingScreen label={mode === "daily" ? "OPENING TODAY'S CASE" : "SETTING THINGS UP"} />;
  }
  if (status === "idle") {
    return (
      <StartScreen
        daily={buildDailyHome(daily, today, Date.now(), formatPuzzleDate)}
        onStartDaily={() => startDaily()}
        onStart={startGame}
        onDayRolled={refreshToday}
        error={error}
      />
    );
  }

  const gameOver = status === "won" || status === "lost";
  const dailyRound = mode === "daily" ? daily.round : null;
  const showDailyResult = gameOver && dailyRound !== null && dailyRound.counted;
  const showPracticeResult = gameOver && revealedTitle !== null && mode === "practice";
  const hasResult = showDailyResult || showPracticeResult;

  return (
    <main className="vignette min-h-screen flex flex-col">
      <header className="border-b border-wire px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={backToMenu} className="shrink-0" aria-label="Back to home">
            <Logo size={32} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-case text-xs tracking-wide text-manila">CASE FILE — OPEN</p>
              <span className="font-case text-[10px] tracking-wide border border-wire rounded px-1.5 py-0.5 text-paperDim uppercase">
                {mode === "daily" ? `Daily No. ${dailyRound?.number ?? ""}`.trim() : difficulty ?? "random"}
              </span>
            </div>
            <h1 className="font-case text-xl">Professionle</h1>
          </div>
        </div>
        <button
          onClick={giveUp}
          disabled={gameOver}
          className="font-case text-xs tracking-wide border border-wire px-3 py-2 text-paperDim hover:border-alert hover:text-alert transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          GIVE UP
        </button>
      </header>
      <RiskMeter count={noCount} />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-3 min-h-0">
          {transcript.length === 0 && (
            <div className="enter h-full flex flex-col items-center justify-center text-center gap-5 py-8">
              <Logo size={40} />
              <p className="text-paperDim/70 italic max-w-sm">
                Ask a yes-or-no question to get started, or tap one of these:
              </p>
              <QuickAsk
                layout="center"
                transcript={transcript}
                tab={quickTab}
                onTab={setQuickTab}
                onPick={(q) => submitQuestion(q, true)}
                disabled={asking || gameOver}
              />
            </div>
          )}
          {transcript.map((entry, i) => (
            <TranscriptRow key={i} entry={entry} />
          ))}
          {asking && <ThinkingIndicator />}
          {hasResult && resultDismissed && (
            <button
              type="button"
              onClick={() => setResultDismissed(false)}
              className="enter mt-2 w-full border-2 border-manila py-3 font-case text-sm tracking-[0.14em] text-manila transition-colors hover:bg-manila hover:text-ink"
            >
              SHOW RESULT
            </button>
          )}
        </div>

        <aside className="flex items-center gap-4 border-t border-wire px-4 py-3 md:block md:w-72 md:space-y-5 md:border-l md:border-t-0 md:px-6 md:py-6">
          <div className="min-w-0 flex-1 md:flex-none">
            <TallyCounter count={noCount} />
          </div>
          <div className="shrink-0 border-l border-wire pl-4 md:border-l-0 md:border-t md:pl-0 md:pt-5">
            <p className="font-case text-xs tracking-wide text-paperDim mb-1">QUESTIONS ASKED</p>
            <p className="text-2xl font-case">{totalQuestions}</p>
          </div>
          <div className="hidden border-t border-wire pt-5 text-xs leading-relaxed text-paperDim/70 md:block">
            Hints unlock automatically at 5 and 8 &ldquo;no&rdquo; answers. Ten &ldquo;no&rdquo;
            answers and the case goes cold — guess the exact title any time to close it early.
          </div>
        </aside>
      </div>

      {error && <p className="px-6 py-2 text-alert text-sm">{error}</p>}

      {!gameOver && transcript.length > 0 && (
        <QuickAsk
          layout="bar"
          transcript={transcript}
          tab={quickTab}
          onTab={setQuickTab}
          onPick={(q) => submitQuestion(q, true)}
          disabled={asking}
        />
      )}

      <form onSubmit={ask} className="border-t border-wire p-4 flex gap-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={gameOver || asking}
          placeholder={gameOver ? "Case closed" : "Ask a yes/no question, or name the job…"}
          className="flex-1 bg-panel border border-wire rounded px-4 py-3 text-paper placeholder:text-paperDim/50 focus:border-manila outline-none disabled:opacity-40"
          maxLength={300}
        />
        <button
          type="submit"
          disabled={gameOver || asking || !input.trim()}
          className="font-case px-5 py-3 bg-manila text-ink font-semibold hover:bg-manilaDeep disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          {asking ? "…" : "ASK"}
        </button>
      </form>
      <ResultModal
        open={hasResult && !resultDismissed}
        delay={endedLiveRef.current ? 800 : 0}
        onClose={() => {
          endedLiveRef.current = false;
          setResultDismissed(true);
        }}
      >
        {showDailyResult && dailyRound && (
          <DailyResult
            number={dailyRound.number}
            won={dailyRound.status === "won"}
            title={dailyRound.revealedTitle ?? revealedTitle ?? "Unknown"}
            score={dailyRound.score ?? 0}
            hintsTaken={countHints(dailyRound.transcript)}
            totalQuestions={dailyRound.totalQuestions}
            stats={{
              streak: daily.stats.streak,
              best: daily.stats.best,
              played: daily.stats.played,
              average: averageQuestions(daily.stats),
            }}
            shareText={buildShareText({
              number: dailyRound.number,
              transcript: dailyRound.transcript,
              won: dailyRound.status === "won",
              totalQuestions: dailyRound.totalQuestions,
              score: dailyRound.score ?? 0,
            })}
            nextAt={dailyRound.nextAt}
            onPractice={backToMenu}
            onNewCase={startNewCase}
          />
        )}
        {showPracticeResult && (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="font-case text-manila text-sm mb-1">
              {status === "won" ? "CASE CLOSED — CORRECT" : "CASE CLOSED"}
            </p>
            <p className="text-2xl">
              The job was: <span className="font-semibold text-paper">{revealedTitle}</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => startGame()}
                className="font-case text-sm border border-manila text-manila px-4 py-2 hover:bg-manila hover:text-ink transition-colors"
              >
                PLAY AGAIN (RANDOM)
              </button>
              <button
                onClick={backToMenu}
                className="font-case text-sm border border-wire text-paperDim px-4 py-2 hover:border-manila hover:text-manila transition-colors"
              >
                CHOOSE DIFFICULTY
              </button>
            </div>
          </div>
        )}
      </ResultModal>
    </main>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-paperDim/70">
      <span className="font-case text-xs">THINKING</span>
      <span className="flex gap-1">
        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
      </span>
    </div>
  );
}

const MAX_NOS = 10;

function RiskMeter({ count }: { count: number }) {
  const pct = Math.min(100, (count / MAX_NOS) * 100);
  const danger = count >= 8;
  return (
    <div className="w-full h-1.5 bg-wire/30">
      <div
        className={`h-full transition-all duration-500 ease-out ${danger ? "bg-alert" : "bg-manila"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TranscriptRow({ entry }: { entry: TranscriptEntry }) {
  if (entry.kind === "hint") {
    return (
      <div className="enter border border-manila/50 bg-panelLight rounded-lg px-4 py-3">
        <p className="font-case text-xs text-manila mb-1">
          CASE NOTE — UNLOCKED AT {entry.level} NOS
        </p>
        <p className="text-paper/90">{entry.text}</p>
      </div>
    );
  }
  if (entry.kind === "wrong_guess") {
    return (
      <div className="enter bg-panel/60 border border-wire rounded-lg px-4 py-3">
        <p className="text-paper/90 italic">&ldquo;{entry.question}&rdquo;</p>
        <p className="font-case text-sm text-paperDim mt-1">✕ Not that one.</p>
      </div>
    );
  }
  return (
    <div className="enter bg-panel/60 border border-wire rounded-lg px-4 py-3 flex items-start justify-between gap-4">
      <p className="text-paper/90 italic flex-1">&ldquo;{entry.question}&rdquo;</p>
      <span
        className={`stamp shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[entry.answer]}`}
      >
        {ANSWER_LABEL[entry.answer]}
      </span>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="vignette min-h-screen flex flex-col items-center justify-center px-6 enter">
      <div className="logo-pulse mb-6">
        <Logo size={72} />
      </div>
      <p className="font-case text-sm tracking-wide text-paperDim mb-3">{label}</p>
      <span className="flex gap-1.5">
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
      </span>
    </main>
  );
}