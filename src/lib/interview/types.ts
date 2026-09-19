import type { Answer } from "@/types";

export type InterviewRole = "answerer" | "asker";
export type InterviewMessageKind = "question" | "answer" | "solved" | "gave_up" | "joined";

export interface InterviewMessage {
  seq: number;
  kind: InterviewMessageKind;
  content: string | null;
  created_at: string;
}

export function isValidInterviewAnswer(value: unknown): value is Answer {
  return (
    value === "yes" ||
    value === "no" ||
    value === "sometimes" ||
    value === "not_really" ||
    value === "irrelevant"
  );
}