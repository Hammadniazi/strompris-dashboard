import { dayPricesSchema, type DayPrices, type PriceZone } from "./types";

const BASE = "https://www.hvakosterstrommen.no/api/v1/prices";

export async function fetchDayPrices(
  date: string,
  zone: PriceZone,
): Promise<DayPrices> {
  const [year, month, day] = date.split("-");
  const res = await fetch(`${BASE}/${year}/${month}-${day}_${zone}.json`);

  if (!res.ok) throw new Error(`Price API failed: ${res.status}`);

  const json = await res.json();
  return dayPricesSchema.parse(json);
}
