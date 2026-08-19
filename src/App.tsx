import { useEffect, useState } from "react";
import { fetchDayPrices, PriceUnavailableError } from "./features/prices/api";
import type { DayPrices } from "./features/prices/types";
import { priceLevel } from "./features/prices/utils";
import { formatOre } from "./lib/format";
import { osloHourLabel, osloToday } from "./lib/time";

const LEVEL_CLASS = {
  cheap: "text-cheap",
  normal: "text-normal",
  expensive: "text-expensive",
} as const;

export default function App() {
  const [prices, setPrices] = useState<DayPrices>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDayPrices(osloToday(), "NO5")
      .then(setPrices)
      .catch((e: unknown) => {
        if (e instanceof PriceUnavailableError) {
          setError(
            e.reason === "not-published"
              ? "Today's prices aren't published yet."
              : "No price data available for this date.",
          );
        } else {
          setError(String(e));
        }
      });
  }, []);

  if (error) return <p className="p-8 text-expensive text-sm">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium">Strømpris NO5</h1>
      <ul className="mt-4">
        {prices.map((p) => (
          <li key={p.time_start} className="flex gap-4 border-b py-1">
            <span className="w-16 tabular-nums">
              {osloHourLabel(p.time_start)}
            </span>
            <span
              className={`tabular-nums ${LEVEL_CLASS[priceLevel(p.NOK_per_kWh, prices)]}`}
            >
              {formatOre(p.NOK_per_kWh)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
