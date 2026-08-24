import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { PriceGauge } from "./components/PriceGauge";
import { fetchDayPrices, PriceUnavailableError } from "./features/prices/api";
import {
  PRICE_ZONES,
  priceZoneSchema,
  ZONE_META,
  type PriceZone,
} from "./features/prices/types";
import type { CostSettings } from "./features/prices/utils";
import {
  cheapestWindow,
  costSettingsSchema,
  currentPriceIndex,
  effectivePrice,
  pricePercent,
  priceLevel,
} from "./features/prices/utils";
import { formatNok, formatOre } from "./lib/format";
import {
  osloHourLabel,
  osloToday,
  osloTomorrow,
  tomorrowIsPublished,
} from "./lib/time";
import { usePersistedState } from "./lib/usePersistedState";

const hoursSchema = z.number().int().positive();

const LEVEL_TEXT = {
  cheap: "text-cheap",
  normal: "text-normal",
  expensive: "text-expensive",
} as const;

const LEVEL_DOT = {
  cheap: "bg-cheap",
  normal: "bg-normal",
  expensive: "bg-expensive",
} as const;

// Placeholder figures — nettleie varies by grid operator and time of day.
const DEFAULT_SETTINGS: CostSettings = {
  includeVat: true,
  paslagOre: 0,
  nettleieOre: 45,
};

function errorMessage(error: Error): string {
  if (error instanceof PriceUnavailableError) {
    return error.reason === "not-published"
      ? "Not published yet. Tomorrow's prices land around 13:00."
      : "No data available before December 2021.";
  }
  return `Couldn't load prices: ${error.message}`;
}

const inputClass =
  "rounded-md border border-fjord-700 bg-fjord-950 px-2 py-1 font-mono text-sm text-frost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50";

export default function App() {
  const today = osloToday();
  const tomorrow = osloTomorrow();
  const [zone, setZone] = usePersistedState(
    "strompris.zone",
    priceZoneSchema,
    "NO5",
  );
  const [day, setDay] = useState<"today" | "tomorrow">("today");
  const [settings, setSettings] = usePersistedState(
    "strompris.settings",
    costSettingsSchema,
    DEFAULT_SETTINGS,
  );
  const [hours, setHours] = usePersistedState(
    "strompris.hours",
    hoursSchema,
    3,
  );
  const date = day === "today" ? today : tomorrow;
  const {
    data: prices = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ["prices", zone, date],
    queryFn: () => fetchDayPrices(date, zone),
  });

  const window = useMemo(() => cheapestWindow(prices, hours), [prices, hours]);
  const nowIndex = useMemo(() => currentPriceIndex(prices), [prices]);

  const avgEffective = useMemo(() => {
    if (prices.length === 0) return null;
    const sum = prices.reduce(
      (total, p) => total + effectivePrice(p, zone, settings),
      0,
    );
    return sum / prices.length;
  }, [prices, zone, settings]);

  const nowPrice = nowIndex !== null ? prices[nowIndex] : undefined;

  if (isPending) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <p className="font-mono text-sm text-mist">
          Fetching {day}'s prices…
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <p className="max-w-sm text-center text-sm text-expensive">
          {errorMessage(error)}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-frost sm:text-3xl">
          Strømpris
        </h1>
        <div className="inline-flex rounded-full border border-fjord-700 bg-fjord-850 p-1 text-sm">
          {(["today", "tomorrow"] as const).map((d) => (
            <button
              key={d}
              type="button"
              disabled={d === "tomorrow" && !tomorrowIsPublished()}
              onClick={() => setDay(d)}
              title={
                d === "tomorrow" && !tomorrowIsPublished()
                  ? "Tomorrow's prices publish ~13:00 Oslo time"
                  : undefined
              }
              className={`rounded-full px-3 py-1 capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50 disabled:cursor-not-allowed disabled:opacity-30 ${
                day === d
                  ? "bg-fjord-700 text-frost"
                  : "text-mist hover:text-frost"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </header>

      <section className="mt-10 flex flex-col items-center gap-8 sm:flex-row">
        <PriceGauge
          prices={prices}
          currentIndex={nowIndex}
          window={window ? { startIndex: window.startIndex, hours } : null}
        >
          {nowPrice ? (
            <>
              <span className="font-mono text-3xl font-medium text-frost">
                {formatOre(effectivePrice(nowPrice, zone, settings))}
              </span>
              <span className="mt-1 text-xs tracking-wide text-mist uppercase">
                now
              </span>
            </>
          ) : (
            <>
              <span className="font-display text-2xl font-semibold text-frost">
                {zone}
              </span>
              <span className="mt-1 text-xs tracking-wide text-mist uppercase">
                {ZONE_META[zone].city}
              </span>
            </>
          )}
        </PriceGauge>

        <div className="w-full flex-1 space-y-4 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="text-sm text-mist">
              {ZONE_META[zone].city} · {ZONE_META[zone].region}
            </p>
            <div className="relative">
              <select
                aria-label="Zone"
                className="appearance-none rounded-md border border-fjord-700 bg-fjord-850 py-1.5 pr-8 pl-3 text-sm text-frost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50"
                value={zone}
                onChange={(e) => setZone(e.target.value as PriceZone)}
              >
                {PRICE_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z} — {ZONE_META[z].city}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-mist"
              >
                ▾
              </span>
            </div>
          </div>

          {avgEffective !== null && (
            <p className="text-sm text-mist">
              Average {day}{" "}
              <span className="font-mono font-medium text-frost">
                {formatNok(avgEffective)}/kWh
              </span>
            </p>
          )}
        </div>
      </section>

      {window &&
        (() => {
          const start = prices[window.startIndex];
          const end =
            prices[window.startIndex + hours - 1]?.time_end ?? start?.time_end;
          if (!start || !end) return null;
          return (
            <section className="mt-8 rounded-xl border border-cheap/30 bg-cheap/5 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs tracking-wide text-cheap uppercase">
                    Cheapest window
                  </p>
                  <p className="mt-1 font-mono text-lg font-medium text-frost">
                    {osloHourLabel(start.time_start)}–{osloHourLabel(end)}
                  </p>
                  <p className="mt-0.5 text-sm text-mist">
                    avg {formatOre(window.avgPrice)} spot
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-mist">
                  Window
                  <input
                    type="number"
                    min={1}
                    max={prices.length}
                    className={`w-14 ${inputClass}`}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                  hours
                </label>
              </div>
            </section>
          );
        })()}

      <section className="mt-8 overflow-hidden rounded-xl border border-fjord-700 bg-fjord-850">
        <ul className="divide-y divide-fjord-700">
          {prices.map((p, i) => {
            const level = priceLevel(p.NOK_per_kWh, prices);
            const isNow = i === nowIndex;
            const inWindow =
              window !== null &&
              i >= window.startIndex &&
              i < window.startIndex + hours;
            return (
              <li
                key={p.time_start}
                className={`flex items-center gap-3 px-4 py-2 sm:gap-4 sm:px-5 ${
                  inWindow ? "bg-cheap/5" : ""
                } ${isNow ? "bg-fjord-700/40" : ""}`}
              >
                <span className="w-12 shrink-0 font-mono text-sm text-mist">
                  {osloHourLabel(p.time_start)}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[level]}`}
                />
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
              </li>
            );
          })}
        </ul>
      </section>

      <details className="group mt-8 rounded-xl border border-fjord-700 bg-fjord-850">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-frost select-none sm:px-5 [&::-webkit-details-marker]:hidden">
          Settings
          <span className="text-mist transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="flex flex-wrap items-center gap-4 border-t border-fjord-700 px-4 py-4 text-sm text-mist sm:px-5">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.includeVat}
              onChange={(e) =>
                setSettings((s) => ({ ...s, includeVat: e.target.checked }))
              }
            />
            Include VAT
          </label>
          <label className="flex items-center gap-2">
            Markup (øre/kWh)
            <input
              type="number"
              className={`w-16 ${inputClass}`}
              value={settings.paslagOre}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  paslagOre: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="flex items-center gap-2">
            Grid rent (øre/kWh)
            <input
              type="number"
              className={`w-16 ${inputClass}`}
              value={settings.nettleieOre}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  nettleieOre: Number(e.target.value),
                }))
              }
            />
          </label>
        </div>
      </details>
    </main>
  );
}
