import { ZONE_META, type HourlyPrice, type PriceZone } from "./types";

export interface CostSettings {
  includeVat: boolean;
  paslagOre: number; // supplier markup, øre/kWh
  nettleieOre: number; // grid rent, øre/kWh
}

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

export type PriceLevel = "cheap" | "normal" | "expensive";

/** Relative to the day's own range — a 2 kr day and a 0.2 kr day both read sensibly. */
export function priceLevel(
  price: number,
  all: readonly HourlyPrice[],
): PriceLevel {
  const values = all.map((p) => p.NOK_per_kWh);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return "normal";
  const pct = (price - min) / (max - min);
  return pct < 0.33 ? "cheap" : pct < 0.66 ? "normal" : "expensive";
}
