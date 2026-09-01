import { LEVEL_DOT } from "./shared";

const LEVELS = ["cheap", "normal", "expensive"] as const;
const LEVEL_LABEL = { cheap: "Billig", normal: "Normal", expensive: "Dyr" };

/**
 * Explains what the gauge's and list's colors mean. The price numbers are
 * always shown as text regardless, but without this, only sighted users get
 * the "this hour is cheap" framing — everyone else just sees numbers.
 */
export function PriceLevelLegend() {
  return (
    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-mist sm:justify-start">
      {LEVELS.map((level) => (
        <span key={level} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[level]}`}
          />
          {LEVEL_LABEL[level]}
        </span>
      ))}
    </div>
  );
}
