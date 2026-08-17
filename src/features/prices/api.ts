import { dayPricesSchema, type DayPrices, type PriceZone } from "./types";

const BASE = "https://www.hvakosterstrommen.no/api/v1/prices";
export class PriceUnavailableError extends Error {
  reason: "not-published" | "before-history";

  constructor(reason: "not-published" | "before-history") {
    super(reason);
    this.name = "PriceUnavailableError";
    this.reason = reason;
  }
}

export async function fetchDayPrices(
  date: string,
  zone: PriceZone,
): Promise<DayPrices> {
  const [year, month, day] = date.split("-");
  const res = await fetch(`${BASE}/${year}/${month}-${day}_${zone}.json`);

  if (res.status === 404) {
    throw new PriceUnavailableError(
      date < "2021-12-01" ? "before-history" : "not-published",
    );
  }
  if (!res.ok) throw new Error(`Price API failed: ${res.status}`);

  const json = await res.json();
  return dayPricesSchema.parse(json);
}
