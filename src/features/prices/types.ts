import { z } from "zod";
export const PRICE_ZONES = ["NO1", "NO2", "NO3", "NO4", "NO5"] as const;
export type PriceZone = (typeof PRICE_ZONES)[number];
export const priceZoneSchema = z.enum(PRICE_ZONES);

export const ZONE_META: Record<
  PriceZone,
  { city: string; region: string; vat: number }
> = {
  NO1: { city: "Oslo", region: "Øst-Norge", vat: 0.25 },
  NO2: { city: "Kristiansand", region: "Sør-Norge", vat: 0.25 },
  NO3: { city: "Trondheim", region: "Midt-Norge", vat: 0.25 },
  NO4: { city: "Tromsø", region: "Nord-Norge", vat: 0 }, // MVA-exempt
  NO5: { city: "Bergen", region: "Vest-Norge", vat: 0.25 },
};
export const hourlyPriceSchema = z.object({
  NOK_per_kWh: z.number(),
  EUR_per_kWh: z.number(),
  EXR: z.number(),
  time_start: z.string().datetime({ offset: true }),
  time_end: z.string().datetime({ offset: true }),
});

export const dayPricesSchema = z.array(hourlyPriceSchema).min(1);

export type HourlyPrice = z.infer<typeof hourlyPriceSchema>;
export type DayPrices = z.infer<typeof dayPricesSchema>;
