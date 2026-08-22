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
    expect(screen.getByText(/loading/i)).toBeDefined();

    expect(await screen.findByText("spot 140 øre")).toBeDefined();
    expect(screen.getByText("spot 150 øre")).toBeDefined();
    expect(screen.getByText("spot 160 øre")).toBeDefined();
  });

  it("switches zones and refetches that zone's prices", async () => {
    renderApp();
    await screen.findByText("spot 140 øre");

    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByLabelText(/zone/i),
      "NO1 — Oslo",
    );

    expect(await screen.findByText("spot 200 øre")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: /NO1 \(Oslo\)/ }),
    ).toBeDefined();
  });

  it("recalculates the effective price when markup changes", async () => {
    renderApp();
    await screen.findByText("spot 140 øre");

    // Default settings: 1.4 * 1.25 (VAT) + 0 markup + 0.45 grid rent = 220 øre.
    expect(screen.getByText("220 øre")).toBeDefined();

    const user = userEvent.setup();
    const markupInput = screen.getByLabelText(/markup/i);
    await user.clear(markupInput);
    await user.type(markupInput, "10");

    // 1.4 * 1.25 + 0.10 + 0.45 = 230 øre.
    expect(await screen.findByText("230 øre")).toBeDefined();
  });
});
