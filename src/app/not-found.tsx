import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="vignette min-h-screen flex items-center justify-center px-6 py-12">
      <div className="enter w-full max-w-md text-center">
        <Logo size={48} />
        <p className="font-case text-xs tracking-wide text-manila mt-6 mb-3">CASE FILE — 404</p>
        <h1 className="font-case text-3xl mb-4">No case on file here.</h1>
        <p className="text-paperDim leading-relaxed mb-8">
          Whatever you were looking for isn&apos;t at this address. Might be worth double-checking
          the link.
        </p>
        <Link
          href="/"
          className="font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors inline-block"
        >
          BACK HOME
        </Link>
      </div>
    </main>
  );
}