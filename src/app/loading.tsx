export default function Loading() {
  return (
    <main className="vignette min-h-screen flex flex-col items-center justify-center gap-3 px-6">
      <p className="font-case text-sm tracking-wide text-paperDim">OPENING FILE</p>
      <span className="flex gap-1.5">
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-manila inline-block" />
      </span>
    </main>
  );
}