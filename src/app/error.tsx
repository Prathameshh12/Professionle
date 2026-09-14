"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="vignette min-h-screen flex items-center justify-center px-6 py-12">
      <div className="enter w-full max-w-md text-center">
        <Logo size={48} />
        <p className="font-case text-xs tracking-wide text-alert mt-6 mb-3">CASE FILE — ERROR</p>
        <h1 className="font-case text-3xl mb-4">Something went wrong.</h1>
        <p className="text-paperDim leading-relaxed mb-8">
          The case file got misplaced somewhere along the way. It&apos;s not you — try again, or
          head back and start a new one.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="font-case text-sm border border-manila text-manila px-5 py-3 hover:bg-manila hover:text-ink transition-colors"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="font-case text-sm border border-wire text-paperDim px-5 py-3 hover:border-manila hover:text-manila transition-colors"
          >
            BACK HOME
          </Link>
        </div>
      </div>
    </main>
  );
}