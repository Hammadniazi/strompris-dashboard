import { describe, expect, it } from "vitest";
import {
  osloHourLabel,
  osloToday,
  osloTomorrow,
  tomorrowIsPublished,
} from "./time";

describe("osloHourLabel", () => {
  it("formats an ISO string as Oslo local HH:mm in summer (CEST, UTC+2)", () => {
    expect(osloHourLabel("2026-08-15T12:00:00Z")).toBe("14:00");
  });

  it("formats an ISO string as Oslo local HH:mm in winter (CET, UTC+1)", () => {
    expect(osloHourLabel("2026-01-15T12:00:00Z")).toBe("13:00");
  });
});

describe("osloToday", () => {
  it("returns the Oslo calendar date, not UTC's", () => {
    // 22:30 UTC is already past midnight in Oslo (UTC+2 in August).
    expect(osloToday(new Date("2026-08-15T22:30:00Z"))).toBe("2026-08-16");
  });
});

describe("osloTomorrow", () => {
  it("is exactly one Oslo calendar day after osloToday", () => {
    const now = new Date("2026-08-15T10:00:00Z");
    expect(osloToday(now)).toBe("2026-08-15");
    expect(osloTomorrow(now)).toBe("2026-08-16");
  });

  it("stays one calendar day ahead across the spring-forward DST gap", () => {
    // 2026-03-29 is the night Oslo clocks jump 02:00 -> 03:00, so that Oslo
    // calendar day is only 23 real hours long. Adding a literal 24h in ms
    // overshoots past midnight on the 30th instead of landing on the 29th.
    expect(osloTomorrow(new Date("2026-03-28T22:30:00Z"))).toBe("2026-03-29");
  });

  it("stays one calendar day ahead across the autumn fall-back", () => {
    // 2026-10-25 is the night Oslo clocks repeat 02:00 -> 01:00, so that
    // Oslo calendar day is 25 real hours long instead of 24.
    expect(osloTomorrow(new Date("2026-10-24T21:30:00Z"))).toBe("2026-10-25");
  });
});

describe("tomorrowIsPublished", () => {
  it("is false before 13:00 Oslo time", () => {
    // 10:00 UTC = 12:00 Oslo in August.
    expect(tomorrowIsPublished(new Date("2026-08-15T10:00:00Z"))).toBe(false);
  });

  it("is true at or after 13:00 Oslo time", () => {
    // 11:00 UTC = 13:00 Oslo in August.
    expect(tomorrowIsPublished(new Date("2026-08-15T11:00:00Z"))).toBe(true);
  });
});
