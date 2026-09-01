import { SIZE } from "./PriceGauge";

/**
 * Approximates the real layout's shape (gauge circle, zone picker, cheapest-
 * window card, price rows) so data landing doesn't cause a layout jump.
 * `animate-pulse` already respects prefers-reduced-motion via the global
 * override in index.css.
 */
export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="mt-10 animate-pulse" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>

      <div aria-hidden="true">
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          <div
            className="shrink-0 rounded-full bg-fjord-850"
            style={{ width: SIZE, height: SIZE }}
          />
          <div className="w-full flex-1 space-y-4">
            <div className="mx-auto h-4 w-40 rounded bg-fjord-850 sm:mx-0" />
            <div className="mx-auto h-11 w-48 rounded-md bg-fjord-850 sm:mx-0" />
            <div className="mx-auto h-4 w-32 rounded bg-fjord-850 sm:mx-0" />
          </div>
        </div>

        <div className="mt-8 h-28 rounded-xl border border-fjord-700 bg-fjord-850/60" />

        <div className="mt-8 overflow-hidden rounded-xl border border-fjord-700 bg-fjord-850">
          <div className="divide-y divide-fjord-700">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-2 sm:px-5"
              >
                <div className="h-4 w-10 rounded bg-fjord-950" />
                <div className="hidden h-1.5 flex-1 rounded-full bg-fjord-950 sm:block" />
                <div className="h-4 w-16 rounded bg-fjord-950" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
