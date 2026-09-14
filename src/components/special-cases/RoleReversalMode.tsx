"use client";

import { useEffect, useRef, useState } from "react";
import type { RoleReversalMove, RoleReversalTurn } from "@/lib/llm/types";
import type { Answer } from "@/types";

const ANSWER_LABEL: Record<Answer, string> = {
  yes: "YES",
  no: "NO",
  sometimes: "SOMETIMES",
  not_really: "NOT REALLY",
  irrelevant: "N/A",
};

const ANSWER_COLOR: Record<Answer, string> = {
  yes: "text-emerald-400 border-emerald-400",
  no: "text-alert border-alert",
  sometimes: "text-manila border-manila",
  not_really: "text-alert/80 border-alert/80",
  irrelevant: "text-paperDim border-paperDim",
};

const ANSWER_ORDER: Answer[] = ["yes", "no", "sometimes", "not_really", "irrelevant"];
const DEFAULT_MAX_TURNS = 15;
const AUTO_RETRY_DELAY_MS = 4000;

type Status = "idle" | "starting" | "active" | "ended";
type EndReason = "solved" | "stumped" | "gave_up" | null;

export function RoleReversalMode() {
  const [status, setStatus] = useState<Status>("idle");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [turns, setTurns] = useState<RoleReversalTurn[]>([]);
  const [currentMove, setCurrentMove] = useState<RoleReversalMove | null>(null);
  const [turnNumber, setTurnNumber] = useState(0);
  const [maxTurns, setMaxTurns] = useState(DEFAULT_MAX_TURNS);
  const [fetchingNext, setFetchingNext] = useState(false);
  const [solvedTitle, setSolvedTitle] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<EndReason>(null);
  const [revealInput, setRevealInput] = useState("");
  const [revealSubmitted, setRevealSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorRetryable, setErrorRetryable] = useState(false);
  const [errorExhausted, setErrorExhausted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingHistoryRef = useRef<RoleReversalTurn[]>([]);
  const autoRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, fetchingNext, currentMove]);

  useEffect(() => {
    return () => {
      if (autoRetryTimeoutRef.current) clearTimeout(autoRetryTimeoutRef.current);
    };
  }, []);

  async function fetchMove(history: RoleReversalTurn[], round: string) {
    if (fetchingNext) return; // guard against an overlapping manual + scheduled retry
    if (autoRetryTimeoutRef.current) {
      clearTimeout(autoRetryTimeoutRef.current);
      autoRetryTimeoutRef.current = null;
    }
    pendingHistoryRef.current = history;
    setFetchingNext(true);
    setError(null);
    setErrorRetryable(false);
    setErrorExhausted(false);
    try {
      const res = await fetch("/api/role-reversal/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round_id: round, history }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err: any = new Error(data.error ?? "Something went wrong");
        err.retryable = Boolean(data.retryable);
        err.exhausted = Boolean(data.exhausted);
        throw err;
      }
      setCurrentMove({ type: data.type, text: data.text });
      setTurnNumber(data.turn_number);
      setMaxTurns(data.max_turns ?? DEFAULT_MAX_TURNS);
      setStatus("active");
    } catch (err: any) {
      setError(err.message);
      setErrorRetryable(Boolean(err.retryable));
      setErrorExhausted(Boolean(err.exhausted));
      if (err.retryable) {
        autoRetryTimeoutRef.current = setTimeout(() => {
          fetchMove(pendingHistoryRef.current, round);
        }, AUTO_RETRY_DELAY_MS);
      }
    } finally {
      setFetchingNext(false);
    }
  }

  async function startRound() {
    const round = crypto.randomUUID();
    setRoundId(round);
    setTurns([]);
    setCurrentMove(null);
    setTurnNumber(0);
    setMaxTurns(DEFAULT_MAX_TURNS);
    setSolvedTitle(null);
    setEndReason(null);
    setRevealInput("");
    setRevealSubmitted(false);
    setError(null);
    setErrorRetryable(false);
    setErrorExhausted(false);
    setStatus("starting");
    await fetchMove([], round);
  }

  function handleAnswer(answer: Answer) {
    if (!currentMove || currentMove.type !== "question" || fetchingNext || !roundId) return;
    const newTurns: RoleReversalTurn[] = [...turns, { kind: "qa", question: currentMove.text, answer }];
    setTurns(newTurns);
    setCurrentMove(null);
    if (newTurns.length >= maxTurns) {
      endRound("stumped");
      return;
    }
    fetchMove(newTurns, roundId);
  }

  function handleGuessResponse(wasCorrect: boolean) {
    if (!currentMove || currentMove.type !== "guess" || fetchingNext || !roundId) return;
    if (wasCorrect) {
      setSolvedTitle(currentMove.text);
      setCurrentMove(null);
      endRound("solved");
      return;
    }
    const newTurns: RoleReversalTurn[] = [...turns, { kind: "wrong_guess", guess: currentMove.text }];
    setTurns(newTurns);
    setCurrentMove(null);
    if (newTurns.length >= maxTurns) {
      endRound("stumped");
      return;
    }
    fetchMove(newTurns, roundId);
  }

  function endRound(reason: Exclude<EndReason, null>) {
    setEndReason(reason);
    setStatus("ended");
  }

  function retryFetch() {
    if (roundId) fetchMove(pendingHistoryRef.current, roundId);
  }

  function handleRevealSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!revealInput.trim()) return;
    setRevealSubmitted(true);
  }

  if (status === "idle") {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="enter w-full max-w-md text-center">
          <p className="font-case text-xs tracking-wide text-manila mb-3">MODE — ROLE REVERSAL</p>
          <h2 className="font-case text-2xl mb-4">Switch seats.</h2>
          <p className="text-paperDim leading-relaxed mb-8">
            Think of a real job you&apos;ve done or know well — don&apos;t type it anywhere. The
            system will ask yes-or-no questions and try to guess it, up to {DEFAULT_MAX_TURNS} turns.
          </p>
          <button
            onClick={startRound}
            className="font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors"
          >
            START
          </button>
        </div>
      </div>
    );
  }

  if (status === "starting") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-6">
        <p className="font-case text-sm tracking-wide text-paperDim">THINKING OF A FIRST QUESTION</p>
        <span className="flex gap-1.5">
          <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        </span>
        {error && (
          <div className="text-center mt-4 max-w-sm">
            <p className="text-alert text-sm mb-2">{error}</p>
            {errorRetryable && <p className="font-case text-xs text-paperDim">Retrying automatically…</p>}
            {!errorRetryable && !errorExhausted && (
              <button onClick={startRound} className="font-case text-xs underline text-manila">
                TRY AGAIN
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-6 pt-4">
        <span className="font-case text-xs tracking-wide text-paperDim">ROLE REVERSAL — LIVE ROUND</span>
        {status === "active" && (
          <button
            onClick={() => endRound("gave_up")}
            className="font-case text-xs tracking-wide border border-wire px-3 py-1.5 text-paperDim hover:border-alert hover:text-alert transition-colors"
          >
            END ROUND
          </button>
        )}
      </div>

      <div className="px-6 pt-3 pb-1">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-case text-xs tracking-wide text-paperDim">TURN</span>
          <span className="font-case text-xs text-paperDim">
            {Math.min(turnNumber, maxTurns)} / {maxTurns}
          </span>
        </div>
        <div className="w-full h-1.5 bg-wire/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-manila transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, (turnNumber / maxTurns) * 100)}%` }}
          />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
        {turns.length === 0 && !fetchingNext && (
          <p className="text-paperDim/70 italic text-center py-4">
            Got your job in mind? Here comes the first question.
          </p>
        )}
        {turns.map((turn, i) => (
          <TurnRow key={i} turn={turn} />
        ))}

        {fetchingNext && (
          <div className="flex items-center gap-2 text-paperDim/70">
            <span className="font-case text-xs">THINKING</span>
            <span className="flex gap-1">
              <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
              <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
              <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-paperDim/70 inline-block" />
            </span>
          </div>
        )}

        {error && !fetchingNext && status === "active" && (
          <div className="border border-alert/40 bg-alertDim/20 rounded-lg px-4 py-3">
            <p className="text-alert text-sm mb-2">{error}</p>
            {errorRetryable && <p className="font-case text-xs text-paperDim">Retrying automatically…</p>}
            {!errorRetryable && !errorExhausted && (
              <button onClick={retryFetch} className="font-case text-xs underline text-manila">
                TRY AGAIN
              </button>
            )}
          </div>
        )}

        {status === "active" && !fetchingNext && currentMove && (
          <div className="border border-manila/50 bg-panelLight rounded-lg px-5 py-4">
            <p className="font-case text-xs tracking-wide text-manila mb-2">
              {currentMove.type === "question" ? "THE SYSTEM ASKS" : "THE SYSTEM GUESSES"}
            </p>
            <p className="text-xl text-paper mb-4">
              {currentMove.type === "question" ? currentMove.text : `Is it: ${currentMove.text}?`}
            </p>

            {currentMove.type === "question" ? (
              <div className="flex flex-wrap gap-2">
                {ANSWER_ORDER.map((a) => (
                  <button
                    key={a}
                    onClick={() => handleAnswer(a)}
                    className={`font-case text-sm border-2 px-4 py-2 transition-colors hover:bg-panel ${ANSWER_COLOR[a]}`}
                  >
                    {ANSWER_LABEL[a]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleGuessResponse(true)}
                  className="font-case text-sm border-2 border-emerald-400 text-emerald-400 px-4 py-2 hover:bg-emerald-400 hover:text-ink transition-colors"
                >
                  YES, THAT&apos;S IT
                </button>
                <button
                  onClick={() => handleGuessResponse(false)}
                  className="font-case text-sm border-2 border-alert text-alert px-4 py-2 hover:bg-alert hover:text-ink transition-colors"
                >
                  NOPE
                </button>
              </div>
            )}
          </div>
        )}

        {status === "ended" && (
          <div className="border border-manila/40 bg-panelLight rounded-lg p-5 space-y-4">
            {endReason === "solved" && (
              <div>
                <p className="font-case text-manila text-sm mb-1">SOLVED</p>
                <p className="text-xl">
                  Got it in {turns.length + 1} turn{turns.length === 0 ? "" : "s"}:{" "}
                  <span className="font-semibold text-paper">{solvedTitle}</span>
                </p>
              </div>
            )}
            {endReason === "stumped" && (
              <div>
                <p className="font-case text-alert text-sm mb-1">STUMPED</p>
                <p className="text-paper/90 mb-3">
                  {maxTurns} turns and the system still didn&apos;t get it. What was it, actually?
                </p>
                {!revealSubmitted ? (
                  <form onSubmit={handleRevealSubmit} className="flex gap-2">
                    <input
                      value={revealInput}
                      onChange={(e) => setRevealInput(e.target.value)}
                      placeholder="Type it here — just for you, nothing is sent anywhere"
                      className="flex-1 bg-panel border border-wire rounded px-4 py-3 text-paper placeholder:text-paperDim/50 focus:border-manila outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!revealInput.trim()}
                      className="font-case text-sm px-4 py-3 border border-manila text-manila hover:bg-manila hover:text-ink transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      REVEAL
                    </button>
                  </form>
                ) : (
                  <p className="text-paper/90">
                    <span className="italic">&ldquo;{revealInput.trim()}&rdquo;</span> — oh, my bad!
                    I&apos;ll get it next time.
                  </p>
                )}
              </div>
            )}
            {endReason === "gave_up" && <p className="text-paper/90">Round ended early.</p>}

            <button
              onClick={startRound}
              className="font-case text-sm border border-manila text-manila px-4 py-2 hover:bg-manila hover:text-ink transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TurnRow({ turn }: { turn: RoleReversalTurn }) {
  if (turn.kind === "wrong_guess") {
    return (
      <div className="bg-panel/60 border border-wire rounded-lg px-4 py-3">
        <p className="text-paper/90">
          Guessed: <span className="italic">&ldquo;{turn.guess}&rdquo;</span>
        </p>
        <p className="font-case text-sm text-paperDim mt-1">✕ Nope, not that.</p>
      </div>
    );
  }
  return (
    <div className="bg-panel/60 border border-wire rounded-lg px-4 py-3 flex items-start justify-between gap-4">
      <p className="text-paper/90 flex-1">{turn.question}</p>
      <span className={`shrink-0 font-case text-xs border-2 px-2 py-1 ${ANSWER_COLOR[turn.answer]}`}>
        {ANSWER_LABEL[turn.answer]}
      </span>
    </div>
  );
}