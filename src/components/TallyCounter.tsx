"use client";

const MAX_NOS = 10;
const GROUP_SIZE = 5;

/** Renders `count` scratch-tally marks out of MAX_NOS, grouped in fives. */
export function TallyCounter({ count }: { count: number }) {
  const groups: number[] = [];
  let remaining = count;
  while (remaining > 0) {
    groups.push(Math.min(GROUP_SIZE, remaining));
    remaining -= GROUP_SIZE;
  }
  const danger = count >= 8;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-case text-xs tracking-wide text-paperDim">NO. TALLY</span>
        <span className={`font-case text-sm ${danger ? "text-alert" : "text-paperDim"}`}>
          {count} / {MAX_NOS}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 min-h-[28px]">
        {groups.length === 0 && (
          <span className="text-paperDim/50 text-sm italic">no marks yet</span>
        )}
        {groups.map((size, i) => (
          <TallyGroup key={i} size={size} danger={danger} />
        ))}
      </div>
    </div>
  );
}

function TallyGroup({ size, danger }: { size: number; danger: boolean }) {
  const color = danger ? "#C1443C" : "#EDE6D8";
  const bars = Math.min(size, 4);
  const hasSlash = size === 5;
  return (
    <svg width={hasSlash ? 34 : bars * 7 + 2} height="24" viewBox={`0 0 ${hasSlash ? 34 : bars * 7 + 2} 24`}>
      {Array.from({ length: bars }).map((_, i) => (
        <line
          key={i}
          x1={4 + i * 7}
          y1={2}
          x2={4 + i * 7}
          y2={22}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
      {hasSlash && (
        <line x1={2} y1={22} x2={30} y2={2} stroke={color} strokeWidth={2} strokeLinecap="round" />
      )}
    </svg>
  );
}
