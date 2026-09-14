import type { SpecialCaseMode } from "./SpecialCasesScreen";

const MODES: { key: SpecialCaseMode; label: string; blurb: string }[] = [
  {
    key: "role-reversal",
    label: "Role Reversal",
    blurb: "You think of a job. The system asks the questions.",
  },
  {
    key: "meet-the-creator",
    label: "Meet the Creator",
    blurb: "Same format, except the case file is the creator.",
  },
  {
    key: "blind-case",
    label: "Blind Case",
    blurb: "Same format, except you get zero hints.",
  },
  {
    key: "two-truths",
    label: "Two Truths",
    blurb: "Two overlapping jobs, one answer.",
  },
];

export function SpecialCasesMenu({
  onSelect,
}: {
  onSelect: (mode: SpecialCaseMode) => void;
}) {
  return (
    <div className="h-full flex items-center justify-center px-6 py-12">
      <div className="enter w-full max-w-2xl">
        <p className="font-case text-xs tracking-wide text-paperDim mb-6 text-center">
          PICK A MODE
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onSelect(mode.key)}
              className="text-left border border-wire px-4 py-4 rounded hover:border-manila hover:bg-panelLight transition-colors group"
            >
              <span className="font-case text-base group-hover:text-manila transition-colors block mb-1.5">
                {mode.label}
              </span>
              <span className="text-paperDim text-xs leading-relaxed">{mode.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}