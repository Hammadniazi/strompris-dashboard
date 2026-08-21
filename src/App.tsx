import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchDayPrices, PriceUnavailableError } from "./features/prices/api";
import { PRICE_ZONES, ZONE_META, type PriceZone } from "./features/prices/types";
import type { CostSettings } from "./features/prices/utils";
import { cheapestWindow, effectivePrice, priceLevel } from "./features/prices/utils";
import { formatNok, formatOre } from "./lib/format";
import {
  osloHourLabel,
  osloToday,
  osloTomorrow,
  tomorrowIsPublished,
} from "./lib/time";

const LEVEL_CLASS = {
  cheap: "text-cheap",
  normal: "text-normal",
  expensive: "text-expensive",
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
      ? "Prices for this day aren't published yet."
      : "No price data available for this date.";
  }
  return error.message;
}

export default function App() {
  const today = osloToday();
  const tomorrow = osloTomorrow();
  const [zone, setZone] = useState<PriceZone>("NO5");
  const [day, setDay] = useState<"today" | "tomorrow">("today");
  const [settings, setSettings] = useState<CostSettings>(DEFAULT_SETTINGS);
  const [hours, setHours] = useState(3);
  const date = day === "today" ? today : tomorrow;
  const {
    data: prices = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ["prices", zone, date],
    queryFn: () => fetchDayPrices(date, zone),
  });

  const window = useMemo(
    () => cheapestWindow(prices, hours),
    [prices, hours],
  );

  const avgEffective = useMemo(() => {
    if (prices.length === 0) return null;
    const sum = prices.reduce(
      (total, p) => total + effectivePrice(p, zone, settings),
      0,
    );
    return sum / prices.length;
  }, [prices, zone, settings]);

  if (isPending) return <p className="p-8 text-sm">Loading prices…</p>;
  if (error) return <p className="p-8 text-expensive text-sm">{errorMessage(error)}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium">
        Strømpris {zone} ({ZONE_META[zone].city})
      </h1>

      <div className="mt-4 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setDay("today")}
          className={`border-b ${day === "today" ? "font-medium" : "opacity-60"}`}
        >
          Today
        </button>
        <button
          type="button"
          disabled={!tomorrowIsPublished()}
          onClick={() => setDay("tomorrow")}
          title={
            tomorrowIsPublished()
              ? undefined
              : "Tomorrow's prices publish ~13:00 Oslo time"
          }
          className={`border-b disabled:cursor-not-allowed disabled:opacity-30 ${
            day === "tomorrow" ? "font-medium" : "opacity-60"
          }`}
        >
          Tomorrow
        </button>
      </div>

      <fieldset className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <legend className="sr-only">Cost settings</legend>
        <label className="flex items-center gap-2">
          Zone
          <select
            className="border-b"
            value={zone}
            onChange={(e) => setZone(e.target.value as PriceZone)}
          >
            {PRICE_ZONES.map((z) => (
              <option key={z} value={z}>
                {z} — {ZONE_META[z].city}
              </option>
            ))}
          </select>
        </label>
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
            className="w-16 border-b"
            value={settings.paslagOre}
            onChange={(e) =>
              setSettings((s) => ({ ...s, paslagOre: Number(e.target.value) }))
            }
          />
        </label>
        <label className="flex items-center gap-2">
          Grid rent (øre/kWh)
          <input
            type="number"
            className="w-16 border-b"
            value={settings.nettleieOre}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                nettleieOre: Number(e.target.value),
              }))
            }
          />
        </label>
        <label className="flex items-center gap-2">
          Run for
          <input
            type="number"
            min={1}
            max={prices.length}
            className="w-14 border-b"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
          hours
        </label>
      </fieldset>

      {avgEffective !== null && (
        <p className="mt-4 text-sm">
          Average {day}:{" "}
          <span className="font-medium">{formatNok(avgEffective)}/kWh</span>
        </p>
      )}

      {window &&
        (() => {
          const start = prices[window.startIndex];
          const end =
            prices[window.startIndex + hours - 1]?.time_end ?? start?.time_end;
          if (!start || !end) return null;
          return (
            <p className="mt-4 text-sm">
              Cheapest {hours}-hour window:{" "}
              <span className="text-cheap font-medium">
                {osloHourLabel(start.time_start)}–{osloHourLabel(end)}
              </span>{" "}
              (avg spot {formatOre(window.avgPrice)})
            </p>
          );
        })()}

      <ul className="mt-4">
        {prices.map((p, i) => (
          <li
            key={p.time_start}
            className={`flex gap-4 border-b py-1 ${
              window &&
              i >= window.startIndex &&
              i < window.startIndex + hours
                ? "bg-cheap/10"
                : ""
            }`}
          >
            <span className="w-16 tabular-nums">
              {osloHourLabel(p.time_start)}
            </span>
            <span
              className={`w-24 tabular-nums ${LEVEL_CLASS[priceLevel(p.NOK_per_kWh, prices)]}`}
            >
              {formatOre(effectivePrice(p, zone, settings))}
            </span>
            <span className="tabular-nums text-sm opacity-60">
              spot {formatOre(p.NOK_per_kWh)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
