import {
  SpecialCasesScreen,
  type SpecialCaseMode,
} from "@/components/special-cases/SpecialCasesScreen";

const MODES: SpecialCaseMode[] = [
  "role-reversal",
  "meet-the-creator",
  "blind-case",
  "two-truths",
];

export default function SpecialCasesPage({
  searchParams,
}: {
  searchParams: { mode?: string | string[] };
}) {
  const raw = Array.isArray(searchParams.mode)
    ? searchParams.mode[0]
    : searchParams.mode;
  const initialMode = MODES.find((m) => m === raw) ?? null;

  return (
    <SpecialCasesScreen key={initialMode ?? "menu"} initialMode={initialMode} />
  );
}