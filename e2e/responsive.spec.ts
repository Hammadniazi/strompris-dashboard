import { expect, test } from "@playwright/test";

const PRICE_API = /hvakosterstrommen\.no\/api\/v1\/prices\/.+\.json$/;

// 24 hours with real variation, so color-coding and the gauge look realistic.
function makeDayResponse() {
  const base = [
    140, 139, 139, 138, 136, 137, 143, 156, 169, 164, 146, 140, 138, 137, 138,
    137, 139, 143, 142, 141, 138, 140, 139, 138,
  ];
  return base.map((ore, i) => {
    const h = String(i).padStart(2, "0");
    const price = ore / 100;
    return {
      NOK_per_kWh: price,
      EUR_per_kWh: price / 11,
      EXR: 11,
      time_start: `2026-01-01T${h}:00:00+01:00`,
      time_end: `2026-01-01T${h}:59:59+01:00`,
    };
  });
}

const VIEWPORTS = [
  { name: "small phone", width: 360, height: 740 },
  { name: "large phone", width: 430, height: 932 },
  { name: "tablet portrait", width: 768, height: 1024 },
  { name: "small laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("has no horizontal overflow and shows every key control", async ({
      page,
    }) => {
      await page.route(PRICE_API, (route) =>
        route.fulfill({ json: makeDayResponse() }),
      );

      await page.goto("/");
      await expect(page.getByText("spot 140 øre").first()).toBeVisible();

      // The page itself must never need horizontal scrolling.
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // Every primary control is present and actually visible, not just
      // in the DOM (a common way overflow/clipping hides things silently).
      await expect(
        page.getByRole("heading", { name: "Strømpris" }),
      ).toBeVisible();
      await expect(page.getByLabel(/sone/i)).toBeVisible();
      await expect(page.getByRole("button", { name: "I dag" })).toBeVisible();
      await expect(page.getByText(/billigste vindu/i)).toBeVisible();
      await expect(page.getByLabel(/vindu/i)).toBeVisible();
      await expect(page.getByLabel(/bruker/i)).toBeVisible();
      await expect(
        page.locator("summary", { hasText: "Innstillinger" }),
      ).toBeVisible();

      await page.screenshot({
        path: `test-results/responsive-${viewport.name.replace(/\s+/g, "-")}.png`,
        fullPage: true,
      });
    });

    test("settings panel opens and its inputs stay reachable", async ({
      page,
    }) => {
      await page.route(PRICE_API, (route) =>
        route.fulfill({ json: makeDayResponse() }),
      );

      await page.goto("/");
      await page.locator("summary", { hasText: "Innstillinger" }).click();

      await expect(page.getByLabel(/inkluder mva/i)).toBeVisible();
      await expect(page.getByLabel(/påslag/i)).toBeVisible();
      await expect(page.getByLabel(/nettleie/i)).toBeVisible();

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });
}
