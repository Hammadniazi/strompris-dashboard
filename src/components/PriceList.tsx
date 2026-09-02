import type { DayPrices, PriceZone } from "@/features/prices/types";
import {
  effectivePrice,
  priceLevel,
  pricePercent,
  type CostSettings,
} from "@/features/prices/utils";
import { formatOre } from "@/lib/format";
import { osloHourLabel } from "@/lib/time";
import { LEVEL_DOT, LEVEL_TEXT } from "./shared";

export interface PriceListProps {
  prices: DayPrices;
  zone: PriceZone;
  settings: CostSettings;
  nowIndex: number | null;
  bestWindow: { startIndex: number } | null;
  hours: number;
}

export function PriceList({
  prices,
  zone,
  settings,
  nowIndex,
  bestWindow,
  hours,
}: PriceListProps) {
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-fjord-700 bg-fjord-850">
      <h2 className="sr-only">Timepriser</h2>
      <ul className="divide-y divide-fjord-700">
        {prices.map((p, i) => {
          const level = priceLevel(p.NOK_per_kWh, prices);
          const isNow = i === nowIndex;
          const inWindow =
            bestWindow !== null &&
            i >= bestWindow.startIndex &&
            i < bestWindow.startIndex + hours;
          return (
            <li
              key={p.time_start}
              className={`relative flex items-center gap-3 px-4 py-2 sm:gap-4 sm:px-5 ${
                inWindow ? "bg-cheap/5" : ""
              } ${isNow ? "bg-fjord-700/40" : ""}`}
            >
              <span className="w-12 shrink-0 font-mono text-sm text-mist">
                {osloHourLabel(p.time_start)}
              </span>
              {/* Desktop: the bar sits inline between time and price, taking
                  its own flex space (there's room). Mobile: the row is
                  already tight with three text columns, so the same signal
                  renders as a thin strip along the row's own bottom edge
                  instead - it stays the width-encodes-magnitude bar (not
                  colour alone), just out of the horizontal flex flow so it
                  can't push the price columns into overflow. */}
              <span className="hidden flex-1 sm:block">
                <span
                  className={`block h-1.5 rounded-full ${LEVEL_DOT[level]} opacity-40`}
                  style={{
                    width: `${Math.max(pricePercent(p.NOK_per_kWh, prices) * 100, 6)}%`,
                  }}
                />
              </span>
              <span
                className={`w-20 shrink-0 text-right font-mono text-sm font-medium tabular-nums ${LEVEL_TEXT[level]}`}
              >
                {formatOre(effectivePrice(p, zone, settings))}
              </span>
              <span className="w-28 shrink-0 text-right font-mono text-xs whitespace-nowrap tabular-nums text-mist">
                spot {formatOre(p.NOK_per_kWh)}
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-x-4 bottom-0 h-1 overflow-hidden rounded-full bg-fjord-700/60 sm:hidden"
              >
                <span
                  className={`block h-full rounded-full ${LEVEL_DOT[level]} opacity-70`}
                  style={{
                    width: `${Math.max(pricePercent(p.NOK_per_kWh, prices) * 100, 6)}%`,
                  }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
