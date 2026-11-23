import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { CreatorProfile } from "@/components/CreatorProfile";
import { CREATOR_INFO } from "@/components/special-cases/creatorInfo";

export const metadata: Metadata = {
  title: "About - Professionle",
  description: `What Professionle is, how it works and who built it. ${CREATOR_INFO.name}: ${CREATOR_INFO.tagline}`,
};

// Uses the Email link from creatorInfo.ts. It must start with "mailto:" for this to show.
const emailUrl = CREATOR_INFO.links.find((l) => l.label === "Email")?.url ?? "";
const feedbackHref = emailUrl.startsWith("mailto:")
  ? `${emailUrl}?subject=${encodeURIComponent("Professionle feedback")}`
  : "";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-case text-xs tracking-wide text-manila mb-2">{children}</p>;
}

export default function AboutPage() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: CREATOR_INFO.name,
    description: CREATOR_INFO.tagline,
    sameAs: CREATOR_INFO.links.filter((l) => l.url.startsWith("http")).map((l) => l.url),
  };

  return (
    <main className="vignette min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="border-b border-wire px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to home" className="shrink-0">
            <Logo size={32} />
          </Link>
          <div>
            <p className="font-case text-xs tracking-wide text-manila">CASE FILE · ABOUT</p>
            <h1 className="font-case text-xl">About Professionle</h1>
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
        <div className="enter mx-auto w-full max-w-2xl space-y-12">
          {/* The game */}
          <section id="game">
            <Eyebrow>THE GAME</Eyebrow>
            <p className="text-paper/90 leading-relaxed">
              You are secretly given a job and have to work out what it is. Ask yes-or-no questions,
              guess whenever you like, and try to solve it before you run out of nos. There is a new
              case every day.
            </p>
            <p className="text-paperDim text-sm leading-relaxed mt-3">
              Professionle is inspired by &ldquo;That&apos;s My Job&rdquo;, a series on Suhani Shah&apos;s YouTube
              channel.
            </p>
          </section>

          {/* How answers work */}
          <section id="how">
            <Eyebrow>HOW THE ANSWERS WORK</Eyebrow>
            <p className="text-paper/90 leading-relaxed">
              Every job has a written profile. When you ask a question, an AI model reads that profile and
              picks one of five answers: yes, sometimes, not really, no or irrelevant. The answer is then
              saved, so the same question gets the same answer for the next player.
            </p>
            <p className="text-paperDim text-sm leading-relaxed mt-3">
              It is not perfect. Some questions are a judgement call, and now and then an answer will be
              off. If you spot one, please tell me
              {feedbackHref ? (
                <>
                  {" "}
                  <a className="underline decoration-manila underline-offset-4 hover:text-manila" href={feedbackHref}>
                    by email
                  </a>
                </>
              ) : null}
              . I fix them by hand.
            </p>
          </section>

          {/* Privacy */}
          <section id="privacy">
            <Eyebrow>YOUR DATA</Eyebrow>
            <ul className="space-y-2 text-paper/80 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-manila" />
                <span>No account and no sign up.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-manila" />
                <span>Your daily round, score and streak are saved in your own browser, not on a server.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-manila" />
                <span>The questions you ask are stored without your name or any personal details, so the answers can be improved.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-manila" />
                <span>The site uses Vercel Analytics to count page views.</span>
              </li>
            </ul>
          </section>

          {/* The creator */}
          <section id="creator" className="scroll-mt-8">
            <Eyebrow>THE CREATOR</Eyebrow>
            <div className="bg-panelLight border border-manila/40 rounded-lg p-6">
              <CreatorProfile />
            </div>
          </section>

          {/* Next step */}
          <div className="border border-wire rounded-lg p-5 text-center">
            <p className="text-paper/90">Ready to solve one?</p>
            <p className="text-paperDim text-sm mt-1 mb-4">Today&apos;s case is waiting.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="font-case text-xs tracking-wide bg-manila text-ink px-5 py-3 hover:bg-paper transition-colors"
              >
                PLAY TODAY&apos;S CASE
              </Link>
              <Link
                href="/faq"
                className="font-case text-xs tracking-wide border border-wire text-paperDim px-5 py-3 hover:border-manila hover:text-manila transition-colors"
              >
                RULES AND FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}