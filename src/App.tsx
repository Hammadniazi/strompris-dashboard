import { useQuery } from "@tanstack/react-query";
import { fetchDayPrices, PriceUnavailableError } from "./features/prices/api";
import { priceLevel } from "./features/prices/utils";
import { formatOre } from "./lib/format";
import { osloHourLabel, osloToday } from "./lib/time";

const LEVEL_CLASS = {
  cheap: "text-cheap",
  normal: "text-normal",
  expensive: "text-expensive",
} as const;

function errorMessage(error: Error): string {
  if (error instanceof PriceUnavailableError) {
    return error.reason === "not-published"
      ? "Today's prices aren't published yet."
      : "No price data available for this date.";
  }
  return error.message;
}

export default function App() {
  const today = osloToday();
  const {
    data: prices = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ["prices", "NO5", today],
    queryFn: () => fetchDayPrices(today, "NO5"),
  });

  if (isPending) return <p className="p-8 text-sm">Loading prices…</p>;
  if (error) return <p className="p-8 text-expensive text-sm">{errorMessage(error)}</p>;

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
