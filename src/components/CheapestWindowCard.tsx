import type { HourlyPrice } from "@/features/prices/types";
import { formatOre } from "@/lib/format";
import { osloHourLabel } from "@/lib/time";
import { inputClass } from "./shared";

export interface CheapestWindowCardProps {
  bestWindow: { avgPrice: number } | null;
  windowRange: { start: HourlyPrice; end: string } | null;
  hours: number;
  onHoursChange: (hours: number) => void;
  maxHours: number;
}

export function CheapestWindowCard({
  bestWindow,
  windowRange,
  hours,
  onHoursChange,
  maxHours,
}: CheapestWindowCardProps) {
  return (
    <section className="mt-8 rounded-xl border border-cheap/30 bg-cheap/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-wide text-cheap uppercase">
            Cheapest window
          </p>
          {windowRange && bestWindow ? (
            <>
              <p className="mt-1 font-mono text-lg font-medium text-frost">
                {osloHourLabel(windowRange.start.time_start)}–
                {osloHourLabel(windowRange.end)}
              </p>
              <p className="mt-0.5 text-sm text-mist">
                avg {formatOre(bestWindow.avgPrice)} spot
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-mist">
              Enter a number of hours between 1 and {maxHours}.
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-mist">
          Window
          <input
            type="number"
            min={1}
            max={maxHours}
            className={`w-14 ${inputClass}`}
            value={hours}
            onChange={(e) => onHoursChange(Number(e.target.value))}
          />
          hours
        </label>
      </div>
    </section>
  );
}
