// @vitest-environment node
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { fetchDayPrices, PriceUnavailableError } from "./api";

const BASE = "https://www.hvakosterstrommen.no/api/v1/prices";

const validDay = [
  {
    NOK_per_kWh: 1.4,
    EUR_per_kWh: 0.12,
    EXR: 11.5,
    time_start: "2026-08-15T00:00:00+02:00",
    time_end: "2026-08-15T01:00:00+02:00",
  },
];

const server = setupServer(
  http.get(`${BASE}/2026/08-15_NO5.json`, () => HttpResponse.json(validDay)),
  http.get(
    `${BASE}/2019/08-15_NO5.json`,
    () => new HttpResponse(null, { status: 404 }),
  ),
  http.get(
    `${BASE}/2026/08-16_NO5.json`,
    () => new HttpResponse(null, { status: 404 }),
  ),
  http.get(
    `${BASE}/2026/08-17_NO5.json`,
    () => new HttpResponse(null, { status: 500 }),
  ),
  http.get(
    `${BASE}/2026/08-18_NO5.json`,
    () => HttpResponse.json([{ NOK_per_kWh: "not-a-number" }]),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("fetchDayPrices", () => {
  it("parses a valid response", async () => {
    const result = await fetchDayPrices("2026-08-15", "NO5");
    expect(result).toHaveLength(1);
    expect(result[0]?.NOK_per_kWh).toBe(1.4);
  });

  it("throws PriceUnavailableError('before-history') for dates before the API's history starts", async () => {
    await expect(fetchDayPrices("2019-08-15", "NO5")).rejects.toBeInstanceOf(
      PriceUnavailableError,
    );
    await expect(fetchDayPrices("2019-08-15", "NO5")).rejects.toMatchObject({
      reason: "before-history",
    });
  });

  it("throws PriceUnavailableError('not-published') for a 404 within history", async () => {
    await expect(fetchDayPrices("2026-08-16", "NO5")).rejects.toMatchObject({
      reason: "not-published",
    });
  });

  it("throws a plain Error for non-404 failures", async () => {
    await expect(fetchDayPrices("2026-08-17", "NO5")).rejects.toThrow(
      "Price API failed: 500",
    );
  });

  it("throws on a response that doesn't match the expected shape", async () => {
    await expect(fetchDayPrices("2026-08-18", "NO5")).rejects.toThrow();
  });
});
