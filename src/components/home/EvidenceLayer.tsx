import type { ReactNode } from "react";

/** Faint job icons hidden in the dark. They only show where the cursor's light passes. */
const ICONS: Record<string, ReactNode> = {
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
  plane: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />,
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  hardhat: (
    <>
      <path d="M3 18h18" />
      <path d="M5 18a7 7 0 0 1 14 0" />
      <path d="M10.5 9.5V6h3v3.5" />
    </>
  ),
  chef: (
    <>
      <path d="M7 14a4 4 0 1 1 1.2-7.8 4 4 0 0 1 7.6 0A4 4 0 1 1 17 14z" />
      <path d="M7 14v5h10v-5" />
    </>
  ),
  steth: (
    <>
      <path d="M6 3v6a4 4 0 0 0 8 0V3" />
      <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="10" r="2" />
    </>
  ),
  scales: (
    <>
      <path d="M12 3v17M7 20h10M5 6h14" />
      <path d="M5 6l-3 7a3.2 3.2 0 0 0 6 0zM19 6l-3 7a3.2 3.2 0 0 0 6 0z" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 21V5M8 7h7" />
    </>
  ),
  lens: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="M15 15l6 6" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M16 7l3 3" />
    </>
  ),
};

// [icon, left %, top %, size px, rotation deg]
const PLACEMENTS: [keyof typeof ICONS, number, number, number, number][] = [
  ["wrench", 4, 12, 74, -18],
  ["steth", 90, 10, 70, 14],
  ["hardhat", 12, 40, 80, -8],
  ["chef", 84, 38, 72, 10],
  ["scissors", 6, 68, 66, 22],
  ["plane", 92, 64, 70, -12],
  ["camera", 20, 86, 74, 8],
  ["scales", 76, 84, 72, -6],
  ["gear", 44, 6, 56, 0],
  ["mic", 60, 22, 60, 12],
  ["book", 30, 62, 64, -14],
  ["lens", 68, 56, 60, 6],
  ["key", 50, 90, 58, -20],
  ["gear", 2, 92, 60, 30],
];

export function EvidenceLayer() {
  return (
    <div className="hp-evidence" aria-hidden="true">
      {PLACEMENTS.map(([name, left, top, size, rot], i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, transform: `rotate(${rot}deg)` }}
        >
          {ICONS[name]}
        </svg>
      ))}
    </div>
  );
}