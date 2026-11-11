import type { Answer } from "@/types";
import type { TranscriptEntry } from "@/lib/dailyScore";

export type QuickGroup = {
  id: string;
  label: string;
  questions: string[];
};

/** One-tap questions, grouped by topic. Tapping one asks it straight away. */
export const QUICK_GROUPS: QuickGroup[] = [
  {
    id: "where",
    label: "Where",
    questions: [
      "Do you work indoors?",
      "Do you work outdoors?",
      "Do you work in an office?",
      "Do you travel a lot for work?",
      "Can you work from home?",
      "Do you work night shifts or odd hours?",
    ],
  },
  {
    id: "people",
    label: "People",
    questions: [
      "Do you work with the public?",
      "Do you work in a team?",
      "Do you work alone?",
      "Do you manage other people?",
      "Do you work with children?",
      "Do you help sick or injured people?",
      "Do you work with animals?",
    ],
  },
  {
    id: "skills",
    label: "Skills",
    questions: [
      "Is it a creative job?",
      "Is it physically demanding?",
      "Do you work with your hands?",
      "Do you use a computer most of the day?",
      "Do you use special equipment or tools?",
      "Does it involve a lot of numbers?",
      "Do you do a lot of writing?",
    ],
  },
  {
    id: "training",
    label: "Training",
    questions: [
      "Would I need a degree for this?",
      "Do you need a license or certification?",
      "Does it take years of training?",
      "Is it a trade?",
      "Can you start without any experience?",
    ],
  },
  {
    id: "pay",
    label: "Pay & risk",
    questions: [
      "Does it pay well?",
      "Is it a dangerous job?",
      "Is it a high-stress job?",
      "Is it a common job?",
      "Would most people know what this job is?",
    ],
  },
  {
    id: "industry",
    label: "Industry",
    questions: [
      "Is it in healthcare?",
      "Is it in tech?",
      "Is it in construction?",
      "Is it in food or hospitality?",
      "Is it in arts or media?",
      "Is it in education?",
      "Is it in transport?",
      "Is it in law or government?",
      "Is it in science or research?",
      "Is it in sports or fitness?",
    ],
  },
];

function norm(q: string): string {
  return q.trim().toLowerCase().replace(/[?.!\s]+$/g, "");
}

/** The answer already given to this exact question, or null if it has not been asked yet. */
export function findAnswer(transcript: TranscriptEntry[], question: string): Answer | null {
  const target = norm(question);
  for (const entry of transcript) {
    if (entry.kind === "qa" && norm(entry.question) === target) return entry.answer;
  }
  return null;
}