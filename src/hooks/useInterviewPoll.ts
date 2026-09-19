"use client";

import { useEffect, useRef, useState } from "react";
import type { InterviewMessage } from "@/lib/interview/types";

const POLL_INTERVAL_MS = 2500;
const AWAY_THRESHOLD_MS = 9000;

export function useInterviewPoll(roomId: string | null, token: string | null, active: boolean) {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [status, setStatus] = useState<"waiting" | "active" | "ended">("waiting");
  const [pendingQuestion, setPendingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const [partnerAway, setPartnerAway] = useState(false);
  const sinceRef = useRef(0);
  const seenSeqsRef = useRef<Set<number>>(new Set());
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!roomId || !token || !active) return;
    let cancelled = false;

    sinceRef.current = 0;
    seenSeqsRef.current = new Set();

    async function poll() {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const res = await fetch("/api/interview/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room_id: roomId, token, since: sinceRef.current }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (res.status === 410) {
          setGone(true);
          return;
        }
        if (!res.ok) {
          setError(data.error ?? "Something went wrong");
          return;
        }

        const incoming: InterviewMessage[] = data.messages ?? [];
        const fresh = incoming.filter((m) => !seenSeqsRef.current.has(m.seq));
        if (fresh.length) {
          fresh.forEach((m) => seenSeqsRef.current.add(m.seq));
          setMessages((prev) => [...prev, ...fresh]);
          sinceRef.current = Math.max(sinceRef.current, ...fresh.map((m) => m.seq));
        }
        setStatus(data.status);
        setPendingQuestion(data.pending_question);
        setError(null);

        if (data.partner_last_seen_at) {
          const elapsed = Date.now() - new Date(data.partner_last_seen_at).getTime();
          setPartnerAway(elapsed > AWAY_THRESHOLD_MS);
        } else {
          setPartnerAway(false);
        }
      } catch {
        if (!cancelled) setError("Connection hiccup — retrying…");
      } finally {
        inFlightRef.current = false;
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId, token, active]);

  return { messages, status, pendingQuestion, error, gone, partnerAway };
}