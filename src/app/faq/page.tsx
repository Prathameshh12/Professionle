import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "FAQ - Professionle",
  description:
    "How Professionle works: the rules, hints, scoring, the daily case and the special cases.",
};

const FAQ: { q: string; a: string | string[] }[] = [
  {
    q: "How do I play?",
    a: "Each day there is one mystery job. Ask yes-or-no questions to narrow it down, and type a guess whenever you think you know it. Guess it before you run out of nos and you win.",
  },
  {
    q: "What counts as a no, and how do I lose?",
    a: 'Every question gets one of five answers: yes, sometimes, not really, no or irrelevant. Both "no" and "not really" count as a no. When you reach 10 nos, the case goes cold. A wrong guess does not add a no, but it still counts as a question.',
  },
  {
    q: "Do I get hints?",
    a: "Yes, two. One appears after your 5th no and another after your 8th. They show up on their own, and each one takes 8 points off your score.",
  },
  {
    q: "How is the score worked out?",
    a: "A win starts at 100. Every question after the first costs 3 points and every hint costs 8. A win is never worth less than 10, and a loss scores 0. For example, solving it in 6 questions with 1 hint gives you 77.",
  },
  {
    q: "When does the daily case change?",
    a: "At midnight Sydney time, for everyone. The countdown on the case folder shows how long is left.",
  },
  {
    q: "Do I need an account? Is my progress saved?",
    a: "No account needed. Your round, score and streak are saved in this browser. If you clear your browser data or switch devices, you start fresh.",
  },
  {
    q: "What is the difference between the daily case and practice?",
    a: "The daily case comes once a day and is the one that gets a score and a shareable result. Practice rounds come in easy, medium, hard and random. You can play as many as you like, and they do not count toward your daily result.",
  },
  {
    q: "How do I share my result?",
    a: "When you finish today's case, the result screen has a button to copy or share your score and coloured squares. It never includes the answer, so it is safe to post.",
  },
  {
    q: "What are Special Cases?",
    a: [
      "Two Truths: two overlapping jobs, one answer.",
      "Role Reversal: you think of a job and the system asks the questions, for up to 15 turns.",
      "Meet the Creator: same format, except the case file is the creator.",
      "Blind Case: same format, except you get zero hints.",
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="vignette min-h-screen flex flex-col">
      <header className="border-b border-wire px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to home" className="shrink-0">
            <Logo size={32} />
          </Link>
          <div>
            <p className="font-case text-xs tracking-wide text-manila">CASE FILE — FAQ</p>
            <h1 className="font-case text-xl">Rules and FAQ</h1>
          </div>
        </div>
        <Link
          href="/"
          className="font-case text-xs tracking-wide border border-wire px-3 py-2 text-paperDim hover:border-manila hover:text-manila transition-colors"
        >
          ← BACK TO MAIN GAME
        </Link>
      </header>

      <div className="flex-1 px-6 py-12">
        <div className="enter mx-auto w-full max-w-2xl">
          <p className="font-case text-xs tracking-wide text-paperDim mb-6 text-center">
            THE SHORT VERSION: 10 NOS AND YOU&apos;RE OUT
          </p>

          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group border border-wire rounded open:border-manila transition-colors"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 font-case text-base hover:text-manila transition-colors [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-manila text-xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm leading-relaxed text-paperDim">
                  {Array.isArray(item.a) ? (
                    <ul className="space-y-1.5">
                      {item.a.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.a}</p>
                  )}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-block font-case text-xs tracking-wide border border-manila text-manila px-5 py-3 hover:bg-panelLight transition-colors"
            >
              PLAY TODAY&apos;S CASE
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}