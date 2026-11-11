/**
 * The home screen backdrop: one soft beam of light and a dark figure with a question mark over their head.
 * Pure shapes, no images. It fills its parent (which must be `relative`) and never blocks clicks.
 */
export function Spotlight() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-y-0 left-1/2 w-[min(100%,980px)] -translate-x-1/2"
        style={{
          clipPath: "polygon(43% 0%, 57% 0%, 92% 100%, 8% 100%)",
          backgroundImage: "linear-gradient(to bottom, rgba(201,168,118,0.03), rgba(201,168,118,0.17))",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-12 w-[min(80%,640px)] -translate-x-1/2"
        style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(201,168,118,0.28), rgba(201,168,118,0) 70%)" }}
      />
      <svg
        viewBox="0 0 100 150"
        className="absolute bottom-0 left-1/2 w-[90px] -translate-x-1/2 md:w-[110px]"
      >
        <text x="50" y="30" textAnchor="middle" fontSize="36" fill="#C9A876" className="font-case">
          ?
        </text>
        <circle cx="50" cy="64" r="14" fill="#07090d" />
        <path d="M14 150 C14 108 30 92 50 92 C70 92 86 108 86 150 Z" fill="#07090d" />
      </svg>
    </div>
  );
}