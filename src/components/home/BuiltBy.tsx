import Link from "next/link";
import { CREATOR_INFO } from "@/components/special-cases/creatorInfo";

/** A small "built by" card near the bottom of the home page that leads to /about. */
export function BuiltBy() {
  return (
    <section className="hp-wrap hp-section hp-builtby" aria-label="About the creator">
      <div className="hp-builtby-card">
        <p className="hp-builtby-by font-case">Built by {CREATOR_INFO.name}</p>
        <p className="hp-builtby-line">{CREATOR_INFO.shortLine}</p>
        <Link href="/about" className="hp-builtby-btn font-case">
          About the creator
        </Link>
      </div>
    </section>
  );
}