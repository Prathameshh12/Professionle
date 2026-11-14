import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { CreatorProfile } from "@/components/CreatorProfile";
import { CREATOR_INFO } from "@/components/special-cases/creatorInfo";

export const metadata: Metadata = {
  title: "About the creator - Professionle",
  description: `${CREATOR_INFO.name} built Professionle. ${CREATOR_INFO.tagline}`,
};

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
            <h1 className="font-case text-xl">About the creator</h1>
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
          <div className="bg-panelLight border border-manila/40 rounded-lg p-6">
            <CreatorProfile />
          </div>

          <div className="mt-8 border border-wire rounded-lg p-5 text-center">
            <p className="text-paper/90 mb-4">Want to guess who it is instead?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/special-cases?mode=meet-the-creator"
                className="font-case text-xs tracking-wide border border-manila text-manila px-5 py-3 hover:bg-panelLight transition-colors"
              >
                PLAY MEET THE CREATOR
              </Link>
              <Link
                href="/"
                className="font-case text-xs tracking-wide border border-wire text-paperDim px-5 py-3 hover:border-manila hover:text-manila transition-colors"
              >
                PLAY TODAY&apos;S CASE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}