export function Footer() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pt-6 pb-8 text-center text-xs text-mist sm:px-8 sm:text-left">
      <div className="space-y-1.5 border-t border-fjord-700 pt-6">
        <p>
          Spot prices from{" "}
          <a
            href="https://www.hvakosterstrommen.no"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-frost underline decoration-fjord-700 underline-offset-2 hover:decoration-cheap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50"
          >
            hvakosterstrommen.no
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3 w-3 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M6 4h6v6M12 4 4 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
        <p>
          Grid rent and markup are placeholders — adjust them in Settings to
          match your own grid operator and contract.
        </p>
      </div>
    </footer>
  );
}
