import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import App from "./App";

function makeDayResponse(basePrice: number) {
  return Array.from({ length: 3 }, (_, i) => {
    const h = String(i).padStart(2, "0");
    const price = basePrice + i * 0.1;
    return {
      NOK_per_kWh: price,
      EUR_per_kWh: price / 11,
      EXR: 11,
      time_start: `2026-01-01T${h}:00:00+01:00`,
      time_end: `2026-01-01T${h}:59:59+01:00`,
    };
  });
}

const server = setupServer(
  http.get(
    /\/api\/v1\/prices\/\d{4}\/\d{2}-\d{2}_(\w+)\.json$/,
    ({ request }) => {
      const zone = new URL(request.url).pathname.match(/_(\w+)\.json$/)?.[1];
      return HttpResponse.json(makeDayResponse(zone === "NO1" ? 2 : 1.4));
    },
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App", () => {
  it("shows a loading state, then renders fetched spot prices", async () => {
    renderApp();
    expect(screen.getByText(/henter/i)).toBeDefined();

    expect(await screen.findByText("spot 140 øre")).toBeDefined();
    expect(screen.getByText("spot 150 øre")).toBeDefined();
    expect(screen.getByText("spot 160 øre")).toBeDefined();
  });

  it("switches zones and refetches that zone's prices", async () => {
    renderApp();
    await screen.findByText("spot 140 øre");

    const user = userEvent.setup();
    const zoneSelect = screen.getByLabelText<HTMLSelectElement>(/sone/i);
    await user.selectOptions(zoneSelect, "NO1 — Oslo");

    expect(await screen.findByText("spot 200 øre")).toBeDefined();
    expect(zoneSelect.value).toBe("NO1");
  });

  it("recalculates the effective price when markup changes", async () => {
    renderApp();
    await screen.findByText("spot 140 øre");

    // Default settings: 1.4 * 1.25 (VAT) + 0 markup + 0.45 grid rent = 220 øre.
    expect(screen.getByText("220 øre")).toBeDefined();

    const user = userEvent.setup();
    await user.click(screen.getByText("Innstillinger"));
    const markupInput = screen.getByLabelText(/påslag/i);
    await user.clear(markupInput);
    await user.type(markupInput, "10");

    // 1.4 * 1.25 + 0.10 + 0.45 = 230 øre.
    expect(await screen.findByText("230 øre")).toBeDefined();
  });

  it("shows a friendly message instead of raw JSON when the API response doesn't match the expected shape", async () => {
    server.use(
      http.get(/\/api\/v1\/prices\/\d{4}\/\d{2}-\d{2}_(\w+)\.json$/, () =>
        HttpResponse.json([{ NOK_per_kWh: "not-a-number" }]),
      ),
    );
    renderApp();

    expect(
      await screen.findByText("Mottok uventede data fra pris-API-et."),
    ).toBeDefined();
    expect(screen.queryByText(/invalid_type/)).toBeNull();
  });

  it("keeps the Window control visible and shows guidance when hours exceeds the day's length", async () => {
    localStorage.setItem("strompris.hours", "5");
    renderApp();
    await screen.findByText("spot 140 øre");

    // Fixture day is only 3 hours long, so a persisted 5-hour window is invalid.
    expect(
      screen.getByText("Skriv inn et antall timer mellom 1 og 3."),
    ).toBeDefined();
    expect(screen.getByLabelText(/vindu/i)).toBeDefined();
  });

  it("clamps the Window input to at least 1 hour instead of letting it go blank", async () => {
    renderApp();
    await screen.findByText("spot 140 øre");

    const user = userEvent.setup();
    const windowInput = screen.getByLabelText<HTMLInputElement>(/vindu/i);
    await user.clear(windowInput);

    // Clearing the field (empty -> 0) clamps to 1 instead of vanishing.
    expect(windowInput.value).toBe("1");
    expect(screen.getByText(/billigste vindu/i)).toBeDefined();
  });

  it("shows savings against the day's average when there's no current-hour match", async () => {
    // Fixture dates are always in the past relative to the real clock, so
    // nowIndex is null here — this exercises the average-price fallback
    // used when viewing tomorrow (or if "now" ever falls outside the data).
    localStorage.setItem("strompris.hours", "1");
    server.use(
      http.get(/\/api\/v1\/prices\/\d{4}\/\d{2}-\d{2}_(\w+)\.json$/, () =>
        HttpResponse.json(
          [1, 1, 5, 5, 5].map((price, i) => {
            const h = String(i).padStart(2, "0");
            return {
              NOK_per_kWh: price,
              EUR_per_kWh: price / 11,
              EXR: 11,
              time_start: `2026-01-01T${h}:00:00+01:00`,
              time_end: `2026-01-01T${h}:59:59+01:00`,
            };
          }),
        ),
      ),
    );
    renderApp();

    // Day avg effective: (1.70*2 + 6.70*3) / 5 = 4.70. Cheapest 1h = 1.70.
    // (4.70 - 1.70) * 5 kWh (default) = 15 kr.
    expect(await screen.findByText(/spar ~15,00\s*kr/i)).toBeDefined();
  });
});
