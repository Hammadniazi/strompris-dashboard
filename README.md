# Strømpris

[![CI](https://github.com/Hammadniazi/strompris-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Hammadniazi/strompris-dashboard/actions/workflows/ci.yml)

**Live demo:** [strompris-dashboard.vercel.app](https://strompris-dashboard.vercel.app/)

![Screenshot of the Strømpris dashboard showing hourly electricity prices and the cheapest window to use them](docs/screenshot.png)

A live electricity spot-price checker for Norway. Shows hourly prices for
today (and tomorrow, once published) across all five price zones, what you
actually pay after VAT, supplier markup, and grid rent, and the cheapest
contiguous window to run an appliance.

Data comes from the public [hvakosterstrommen.no](https://www.hvakosterstrommen.no/)
API — no API key or backend required.

## Features

- Hourly spot prices for zones NO1–NO5, color-coded cheap/normal/expensive
  relative to the day's own range
- Effective price: spot + VAT (NO4 is VAT-exempt) + markup + grid rent,
  adjustable in Settings
- Cheapest N-hour window finder
- Today/tomorrow toggle (tomorrow's prices publish ~13:00 Oslo time)
- Zone, cost settings, and window length persist across visits
- Shareable per-zone URLs (e.g. `/no1`)

## Running it

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
```

## Testing

```bash
npm run typecheck    # type-check only, no emit
npm run test         # unit/component tests, watch mode
npm run test:run     # unit/component tests, single run
npm run test:coverage
npm run test:e2e     # Playwright, against a production build
npm run lint
```

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Zod. Tests with
Vitest, Testing Library, MSW, and Playwright.

## License

[MIT](LICENSE)

## Author

**Hammad Khan** — [@Hammadniazi](https://github.com/Hammadniazi)
