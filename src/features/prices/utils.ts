import { z } from "zod";
import { ZONE_META, type HourlyPrice, type PriceZone } from "./types";

export const costSettingsSchema = z.object({
  includeVat: z.boolean(),
  paslagOre: z.number(),
  nettleieOre: z.number(),
});

export type CostSettings = z.infer<typeof costSettingsSchema>;

/** Spot price → what the customer actually pays, NOK/kWh. */
export function effectivePrice(
  price: HourlyPrice,
  zone: PriceZone,
  s: CostSettings,
): number {
  const vat = s.includeVat ? ZONE_META[zone].vat : 0;
  const spotWithVat = price.NOK_per_kWh * (1 + vat);
  return spotWithVat + s.paslagOre / 100 + s.nettleieOre / 100;
}

/** Cheapest contiguous window of `hours` — "when do I run the dishwasher?" */
export function cheapestWindow(
  prices: readonly HourlyPrice[],
  hours: number,
): { startIndex: number; avgPrice: number } | null {
  if (hours <= 0 || prices.length < hours) return null;

  let sum = 0;
  for (let i = 0; i < hours; i++) sum += prices[i]!.NOK_per_kWh;
  let best = { startIndex: 0, sum };

  for (let i = hours; i < prices.length; i++) {
    sum += prices[i]!.NOK_per_kWh - prices[i - hours]!.NOK_per_kWh;
    if (sum < best.sum) best = { startIndex: i - hours + 1, sum };
  }
  return { startIndex: best.startIndex, avgPrice: best.sum / hours };
}

/** Average effective price over a specific window of hours. */
export function windowEffectiveAverage(
  prices: readonly HourlyPrice[],
  startIndex: number,
  hours: number,
  zone: PriceZone,
  settings: CostSettings,
): number | null {
  const slice = prices.slice(startIndex, startIndex + hours);
  if (slice.length === 0) return null;
  const sum = slice.reduce(
    (total, p) => total + effectivePrice(p, zone, settings),
    0,
  );
  return sum / slice.length;
}

/** Index of the hour `now` falls in, or null if `prices` doesn't cover it. */
export function currentPriceIndex(
  prices: readonly HourlyPrice[],
  now = new Date(),
): number | null {
  const t = now.getTime();
  const index = prices.findIndex(
    (p) =>
      t >= new Date(p.time_start).getTime() && t < new Date(p.time_end).getTime(),
  );
  return index === -1 ? null : index;
}

export type PriceLevel = "cheap" | "normal" | "expensive";

/** Where `price` sits within the day's own min–max range, as 0–1. */
export function pricePercent(
  price: number,
  all: readonly HourlyPrice[],
): number {
  const values = all.map((p) => p.NOK_per_kWh);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0.5;
  return (price - min) / (max - min);
}

/** Relative to the day's own range — a 2 kr day and a 0.2 kr day both read sensibly. */
export function priceLevel(
  price: number,
  all: readonly HourlyPrice[],
): PriceLevel {
  const pct = pricePercent(price, all);
  return pct < 0.33 ? "cheap" : pct < 0.66 ? "normal" : "expensive";
}
