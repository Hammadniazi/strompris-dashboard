import type { ReactNode } from "react";
import type { HourlyPrice } from "../features/prices/types";
import { priceLevel, type PriceLevel } from "../features/prices/utils";
import { osloHourLabel } from "../lib/time";

const SIZE = 330;
const CENTER = SIZE / 2;
const R_INNER = 90;
const R_OUTER = 148;
const GAP_DEG = 1.4;

const LEVEL_FILL: Record<PriceLevel, string> = {
  cheap: "var(--color-cheap)",
  normal: "var(--color-normal)",
  expensive: "var(--color-expensive)",
};

function polarToCartesian(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function annularSectorPath(
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
) {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const outerStart = polarToCartesian(rOuter, startDeg);
  const outerEnd = polarToCartesian(rOuter, endDeg);
  const innerEnd = polarToCartesian(rInner, endDeg);
  const innerStart = polarToCartesian(rInner, startDeg);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function arcPath(r: number, startDeg: number, endDeg: number) {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const start = polarToCartesian(r, startDeg);
  const end = polarToCartesian(r, endDeg);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export interface PriceGaugeProps {
  prices: readonly HourlyPrice[];
  currentIndex: number | null;
  window: { startIndex: number; hours: number } | null;
  children?: ReactNode;
}

/** A 24-hour dial: each hour is a colored arc, read like a dam pressure gauge. */
export function PriceGauge({
  prices,
  currentIndex,
  window,
  children,
}: PriceGaugeProps) {
  const n = prices.length;
  if (n === 0) return null;
  const step = 360 / n;

  return (
    <div
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={
        currentIndex !== null
          ? `Price gauge, currently ${osloHourLabel(prices[currentIndex]!.time_start)}`
          : "Price gauge for the day"
      }
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        {prices.map((p, i) => {
          const start = i * step + GAP_DEG / 2;
          const end = (i + 1) * step - GAP_DEG / 2;
          const level = priceLevel(p.NOK_per_kWh, prices);
          const isNow = i === currentIndex;
          return (
            <path
              key={p.time_start}
              d={annularSectorPath(R_INNER, R_OUTER, start, end)}
              fill={LEVEL_FILL[level]}
              opacity={isNow ? 1 : 0.62}
              className="gauge-arc"
              style={{
                animationDelay: `${i * 14}ms`,
                transformOrigin: `${CENTER}px ${CENTER}px`,
              }}
            />
          );
        })}
        {window && (
          <path
            d={arcPath(
              R_OUTER + 7,
              window.startIndex * step + GAP_DEG / 2,
              (window.startIndex + window.hours) * step - GAP_DEG / 2,
            )}
            stroke="var(--color-cheap)"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {currentIndex !== null && (
          <line
            x1={polarToCartesian(R_INNER - 6, currentIndex * step).x}
            y1={polarToCartesian(R_INNER - 6, currentIndex * step).y}
            x2={polarToCartesian(R_OUTER + 4, currentIndex * step).x}
            y2={polarToCartesian(R_OUTER + 4, currentIndex * step).y}
            stroke="var(--color-frost)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div
          className="flex flex-col items-center"
          style={{ maxWidth: R_INNER * 2 - 24 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
