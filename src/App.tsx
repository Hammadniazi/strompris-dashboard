import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z, ZodError } from "zod";
import { CheapestWindowCard } from "@/components/CheapestWindowCard";
import { DayToggle } from "@/components/DayToggle";
import { PriceGauge } from "@/components/PriceGauge";
import { PriceList } from "@/components/PriceList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ZonePicker } from "@/components/ZonePicker";
import { fetchDayPrices, PriceUnavailableError } from "@/features/prices/api";
import { priceZoneSchema, ZONE_META } from "@/features/prices/types";
import type { CostSettings } from "@/features/prices/utils";
import {
  cheapestWindow,
  costSettingsSchema,
  currentPriceIndex,
  effectivePrice,
  windowEffectiveAverage,
} from "@/features/prices/utils";
import { formatNok, formatOre } from "@/lib/format";
import { osloToday, osloTomorrow } from "@/lib/time";
import { usePersistedState } from "@/lib/usePersistedState";

const hoursSchema = z.number().int().positive();
const kwhSchema = z.number().positive();

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
  if (error instanceof ZodError) {
    return "Received unexpected data from the price API.";
  }
  return `Couldn't load prices: ${error.message}`;
}

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
  const [kwh, setKwh] = usePersistedState("strompris.kwh", kwhSchema, 5);
  const date = day === "today" ? today : tomorrow;
  const {
    data: prices = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ["prices", zone, date],
    queryFn: () => fetchDayPrices(date, zone),
  });

  const bestWindow = useMemo(
    () => cheapestWindow(prices, hours),
    [prices, hours],
  );
  const nowIndex = useMemo(() => currentPriceIndex(prices), [prices]);

  const windowRange = useMemo(() => {
    if (!bestWindow) return null;
    const start = prices[bestWindow.startIndex];
    const end =
      prices[bestWindow.startIndex + hours - 1]?.time_end ?? start?.time_end;
    if (!start || !end) return null;
    return { start, end };
  }, [bestWindow, prices, hours]);

  function clampHours(raw: number): number {
    if (!Number.isFinite(raw)) return 1;
    return Math.min(Math.max(Math.trunc(raw), 1), Math.max(prices.length, 1));
  }

  const avgEffective = useMemo(() => {
    if (prices.length === 0) return null;
    const sum = prices.reduce(
      (total, p) => total + effectivePrice(p, zone, settings),
      0,
    );
    return sum / prices.length;
  }, [prices, zone, settings]);

  const nowPrice = nowIndex !== null ? prices[nowIndex] : undefined;
  const nowEffective = nowPrice
    ? effectivePrice(nowPrice, zone, settings)
    : null;

  const windowEffective = useMemo(() => {
    if (!bestWindow) return null;
    return windowEffectiveAverage(
      prices,
      bestWindow.startIndex,
      hours,
      zone,
      settings,
    );
  }, [bestWindow, prices, hours, zone, settings]);

  // Viewing today: compare against right now. Viewing tomorrow (or no
  // current-hour match): compare against the day's own average instead,
  // since there's no "now" within a future day.
  const savingsBaseline = nowEffective ?? avgEffective;
  const savings =
    windowEffective !== null && savingsBaseline !== null
      ? Math.max(0, (savingsBaseline - windowEffective) * kwh)
      : null;

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
        <DayToggle day={day} onChange={setDay} />
      </header>

      <section className="mt-10 flex flex-col items-center gap-8 sm:flex-row">
        <PriceGauge
          prices={prices}
          currentIndex={nowIndex}
          bestWindow={
            bestWindow ? { startIndex: bestWindow.startIndex, hours } : null
          }
        >
          {nowEffective !== null ? (
            <>
              <span className="font-mono text-2xl font-medium whitespace-nowrap text-frost sm:text-[1.75rem]">
                {formatOre(nowEffective)}
              </span>
              <span className="mt-1.5 text-xs tracking-wide text-mist uppercase">
                now
              </span>
            </>
          ) : (
            <>
              <span className="font-display text-2xl font-semibold text-frost">
                {zone}
              </span>
              <span className="mt-1.5 text-xs tracking-wide text-mist uppercase">
                {ZONE_META[zone].city}
              </span>
            </>
          )}
        </PriceGauge>

        <div className="w-full flex-1 space-y-4 text-center sm:text-left">
          <ZonePicker zone={zone} onChange={setZone} />

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

      <CheapestWindowCard
        bestWindow={bestWindow}
        windowRange={windowRange}
        hours={hours}
        onHoursChange={(raw) => setHours(clampHours(raw))}
        maxHours={prices.length}
        kwh={kwh}
        onKwhChange={(raw) =>
          setKwh(Number.isFinite(raw) && raw > 0 ? raw : 1)
        }
        savings={savings}
      />

      <PriceList
        prices={prices}
        zone={zone}
        settings={settings}
        nowIndex={nowIndex}
        bestWindow={bestWindow}
        hours={hours}
      />

      <SettingsPanel settings={settings} onChange={setSettings} />
    </main>
  );
}
