import { expect, test } from "@playwright/test";

const PRICE_API = /hvakosterstrommen\.no\/api\/v1\/prices\/.+\.json$/;

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

test("shows fetched hourly prices for the default zone", async ({ page }) => {
  await page.route(PRICE_API, (route) =>
    route.fulfill({ json: makeDayResponse(1.4) }),
  );

  await page.goto("/");

  await expect(page.getByText("spot 140 øre", { exact: true })).toBeVisible();
  await expect(page.getByText("spot 150 øre", { exact: true })).toBeVisible();
  await expect(page.getByText("spot 160 øre", { exact: true })).toBeVisible();
});

test("switches zones and fetches that zone's prices", async ({ page }) => {
  await page.route(PRICE_API, (route) => {
    const zone = new URL(route.request().url()).pathname.match(
      /_(\w+)\.json$/,
    )?.[1];
    return route.fulfill({ json: makeDayResponse(zone === "NO1" ? 2 : 1.4) });
  });

  await page.goto("/");
  await expect(page.getByText("spot 140 øre", { exact: true })).toBeVisible();

  const zoneSelect = page.getByLabel(/zone/i);
  await zoneSelect.selectOption("NO1 — Oslo");

  await expect(page.getByText("spot 200 øre", { exact: true })).toBeVisible();
  await expect(zoneSelect).toHaveValue("NO1");
});

test("shows an error message when the API returns a server error", async ({
  page,
}) => {
  await page.route(PRICE_API, (route) => route.fulfill({ status: 500 }));

  await page.goto("/");

  // The app's QueryClient retries failed requests with backoff (~7s total)
  // before surfacing an error, so this needs a longer-than-default timeout.
  await expect(
    page.getByText("Couldn't load prices: Price API failed: 500"),
  ).toBeVisible({ timeout: 15000 });
});
