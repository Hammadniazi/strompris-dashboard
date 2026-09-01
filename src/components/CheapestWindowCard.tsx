import type { HourlyPrice } from "@/features/prices/types";
import { formatNok, formatOre } from "@/lib/format";
import { osloHourLabel } from "@/lib/time";
import { inputClass } from "./shared";

export interface CheapestWindowCardProps {
  bestWindow: { avgPrice: number } | null;
  windowRange: { start: HourlyPrice; end: string } | null;
  hours: number;
  onHoursChange: (hours: number) => void;
  maxHours: number;
  kwh: number;
  onKwhChange: (kwh: number) => void;
  /** Estimated savings in kr from using the window instead of the baseline. */
  savings: number | null;
}

export function CheapestWindowCard({
  bestWindow,
  windowRange,
  hours,
  onHoursChange,
  maxHours,
  kwh,
  onKwhChange,
  savings,
}: CheapestWindowCardProps) {
  return (
    <section className="mt-8 rounded-xl border border-cheap/30 bg-cheap/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div aria-live="polite" aria-atomic="true">
          <h2 className="text-xs tracking-wide text-cheap uppercase">
            Cheapest window
          </h2>
          {windowRange && bestWindow ? (
            <>
              <p className="mt-1 font-mono text-lg font-medium text-frost">
                {osloHourLabel(windowRange.start.time_start)}–
                {osloHourLabel(windowRange.end)}
              </p>
              <p className="mt-0.5 text-sm text-mist">
                avg {formatOre(bestWindow.avgPrice)} spot
              </p>
              {savings !== null && savings >= 0.01 && (
                <p className="mt-1 text-sm font-medium text-cheap">
                  Save ~{formatNok(savings)} using {kwh} kWh here instead
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm text-mist">
              Enter a number of hours between 1 and {maxHours}.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-mist">
          <label className="flex items-center gap-2">
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
          <label className="flex items-center gap-2">
            Using
            <input
              type="number"
              min={0.1}
              step={0.1}
              className={`w-16 ${inputClass}`}
              value={kwh}
              onChange={(e) => onKwhChange(Number(e.target.value))}
            />
            kWh
          </label>
        </div>
      </div>
    </section>
  );
}
