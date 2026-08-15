import { useEffect, useState } from "react";
import { fetchDayPrices } from "./features/prices/api";
import type { DayPrices } from "./features/prices/types";

export default function App() {
  const [prices, setPrices] = useState<DayPrices>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDayPrices("2026-08-14", "NO5")
      .then(setPrices)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <pre className="p-8 text-red-600 text-xs">{error}</pre>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium">Strømpris NO5</h1>
      <ul className="mt-4">
        {prices.map((p) => (
          <li key={p.time_start} className="flex gap-4 border-b py-1">
            <span className="w-16 tabular-nums">
              {p.time_start.slice(11, 16)}
            </span>
            <span className="tabular-nums">
              {(p.NOK_per_kWh * 100).toFixed(1)} øre
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
