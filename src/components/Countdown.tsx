"use client";

import { useEffect, useRef, useState } from "react";
import { formatCountdown, msUntil } from "@/lib/dailyFormat";

/** Milliseconds left until `nextAt`, ticking every second. Null until the first tick or if there is no time. */
export function useCountdown(nextAt: string | null): number | null {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    if (!nextAt) {
      setMs(null);
      return;
    }
    const tick = () => setMs(msUntil(nextAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextAt]);
  return ms;
}

/** Shows HH:MM:SS to the next puzzle. Calls onDone once when it reaches zero. */
export function Countdown({
  nextAt,
  onDone,
  className,
}: {
  nextAt: string | null;
  onDone?: () => void;
  className?: string;
}) {
  const ms = useCountdown(nextAt);
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (ms !== null && ms <= 0 && nextAt && firedFor.current !== nextAt) {
      firedFor.current = nextAt;
      onDone?.();
    }
  }, [ms, nextAt, onDone]);

  return <span className={className}>{ms === null ? "--:--:--" : formatCountdown(ms)}</span>;
}