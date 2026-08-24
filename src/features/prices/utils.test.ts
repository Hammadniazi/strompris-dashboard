import { describe, expect, it } from "vitest";
import type { HourlyPrice } from "./types";
import {
  cheapestWindow,
  currentPriceIndex,
  effectivePrice,
  priceLevel,
  pricePercent,
} from "./utils";

function makePrice(hour: number, nokPerKwh: number): HourlyPrice {
  const h = String(hour).padStart(2, "0");
  return {
    NOK_per_kWh: nokPerKwh,
    EUR_per_kWh: nokPerKwh / 11,
    EXR: 11,
    time_start: `2026-01-01T${h}:00:00+01:00`,
    time_end: `2026-01-01T${h}:59:59+01:00`,
  };
}

describe("effectivePrice", () => {
  it("adds VAT, markup, and grid rent to the spot price", () => {
    const price = makePrice(0, 1);
    const result = effectivePrice(price, "NO5", {
      includeVat: true,
      paslagOre: 10,
      nettleieOre: 45,
    });
    // 1 * 1.25 (25% VAT) + 0.10 + 0.45
    expect(result).toBeCloseTo(1.8);
  });

  it("skips VAT when includeVat is false", () => {
    const price = makePrice(0, 1);
    const result = effectivePrice(price, "NO5", {
      includeVat: false,
      paslagOre: 10,
      nettleieOre: 45,
    });
    expect(result).toBeCloseTo(1.55);
  });

  it("NO4 is VAT-exempt even when includeVat is true", () => {
    const price = makePrice(0, 1);
    const result = effectivePrice(price, "NO4", {
      includeVat: true,
      paslagOre: 0,
      nettleieOre: 0,
    });
    expect(result).toBeCloseTo(1);
  });
});

describe("cheapestWindow", () => {
  const prices = [3, 3, 1, 1, 1, 5, 5].map((v, i) => makePrice(i, v));

  it("finds the cheapest contiguous window", () => {
    const window = cheapestWindow(prices, 3);
    expect(window?.startIndex).toBe(2);
    expect(window?.avgPrice).toBeCloseTo(1);
  });

  it("returns null when asking for more hours than available", () => {
    expect(cheapestWindow(prices, 10)).toBeNull();
  });

  it("returns null for zero or negative hours", () => {
    expect(cheapestWindow(prices, 0)).toBeNull();
    expect(cheapestWindow(prices, -1)).toBeNull();
  });
});

describe("priceLevel", () => {
  const prices = [1, 2, 3].map((v, i) => makePrice(i, v));

  it("classifies the low end of the day's range as cheap", () => {
    expect(priceLevel(1, prices)).toBe("cheap");
  });

  it("classifies the high end of the day's range as expensive", () => {
    expect(priceLevel(3, prices)).toBe("expensive");
  });

  it("treats a flat day (no range) as normal", () => {
    const flat = [2, 2, 2].map((v, i) => makePrice(i, v));
    expect(priceLevel(2, flat)).toBe("normal");
  });
});

describe("pricePercent", () => {
  const prices = [1, 2, 3].map((v, i) => makePrice(i, v));

  it("returns 0 at the day's minimum and 1 at its maximum", () => {
    expect(pricePercent(1, prices)).toBeCloseTo(0);
    expect(pricePercent(3, prices)).toBeCloseTo(1);
  });

  it("returns 0.5 for a flat day", () => {
    const flat = [2, 2, 2].map((v, i) => makePrice(i, v));
    expect(pricePercent(2, flat)).toBe(0.5);
  });
});

describe("currentPriceIndex", () => {
  const prices = [1, 2, 3].map((v, i) => makePrice(i, v));

  it("finds the hour that contains `now`", () => {
    expect(
      currentPriceIndex(prices, new Date("2026-01-01T01:30:00+01:00")),
    ).toBe(1);
  });

  it("returns null when `now` falls outside every hour", () => {
    expect(
      currentPriceIndex(prices, new Date("2027-01-01T00:00:00+01:00")),
    ).toBeNull();
  });
});
