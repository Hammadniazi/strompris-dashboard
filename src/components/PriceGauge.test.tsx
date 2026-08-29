import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { HourlyPrice } from "@/features/prices/types";
import { PriceGauge } from "./PriceGauge";

function makeSequentialPrices(count: number): HourlyPrice[] {
  const base = Date.parse("2026-01-01T00:00:00Z");
  return Array.from({ length: count }, (_, i) => ({
    NOK_per_kWh: 1 + i * 0.1,
    EUR_per_kWh: 0.1,
    EXR: 11,
    time_start: new Date(base + i * 3_600_000).toISOString(),
    time_end: new Date(base + (i + 1) * 3_600_000).toISOString(),
  }));
}

describe("PriceGauge", () => {
  it("renders nothing for an empty day", () => {
    const { container } = render(
      <PriceGauge prices={[]} currentIndex={null} bestWindow={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders one arc per hour on a normal 24-hour day", () => {
    const { container } = render(
      <PriceGauge
        prices={makeSequentialPrices(24)}
        currentIndex={null}
        bestWindow={null}
      />,
    );
    expect(container.querySelectorAll(".gauge-arc")).toHaveLength(24);
  });

  it("renders one arc per hour on a 23-hour spring-forward DST day", () => {
    const { container } = render(
      <PriceGauge
        prices={makeSequentialPrices(23)}
        currentIndex={null}
        bestWindow={null}
      />,
    );
    expect(container.querySelectorAll(".gauge-arc")).toHaveLength(23);
  });

  it("renders one arc per hour on a 25-hour fall-back DST day", () => {
    const { container } = render(
      <PriceGauge
        prices={makeSequentialPrices(25)}
        currentIndex={null}
        bestWindow={null}
      />,
    );
    expect(container.querySelectorAll(".gauge-arc")).toHaveLength(25);
  });

  it("uses a generic aria-label when there's no current hour", () => {
    const { getByRole } = render(
      <PriceGauge
        prices={makeSequentialPrices(24)}
        currentIndex={null}
        bestWindow={null}
      />,
    );
    expect(getByRole("img", { name: "Price gauge for the day" })).toBeDefined();
  });

  it("draws the current-hour tick and names it in the aria-label", () => {
    const prices = makeSequentialPrices(24);
    const { container, getByRole } = render(
      <PriceGauge prices={prices} currentIndex={5} bestWindow={null} />,
    );
    expect(container.querySelector("line")).not.toBeNull();
    expect(
      getByRole("img", { name: /Price gauge, currently \d{2}:\d{2}/ }),
    ).toBeDefined();
  });

  it("draws the cheapest-window highlight arc when a window is given", () => {
    const prices = makeSequentialPrices(24);
    const { container } = render(
      <PriceGauge
        prices={prices}
        currentIndex={null}
        bestWindow={{ startIndex: 2, hours: 3 }}
      />,
    );
    // The highlight is the one <path> not carrying the per-hour gauge-arc class.
    const highlightPaths = Array.from(
      container.querySelectorAll("path:not(.gauge-arc)"),
    );
    expect(highlightPaths).toHaveLength(1);
  });

  it("renders the same arc count on a 23-hour day even with a window and current hour set", () => {
    const prices = makeSequentialPrices(23);
    const { container } = render(
      <PriceGauge
        prices={prices}
        currentIndex={10}
        bestWindow={{ startIndex: 0, hours: 3 }}
      />,
    );
    expect(container.querySelectorAll(".gauge-arc")).toHaveLength(23);
    expect(container.querySelector("line")).not.toBeNull();
  });
});
