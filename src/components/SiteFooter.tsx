import type { ReactNode } from "react";

const GITHUB_URL = "https://github.com/Hammadniazi/strompris-dashboard";
const LINKEDIN_URL = "https://www.linkedin.com/in/hammad-khan-dev/";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-frost underline decoration-fjord-700 underline-offset-2 hover:decoration-cheap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50"
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-3 w-3 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          d="M6 4h6v6M12 4 4 12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only"> (åpnes i en ny fane)</span>
    </a>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-medium tracking-wide text-frost uppercase">
        {title}
      </h2>
      <div className="space-y-2 text-xs leading-relaxed text-mist">
        {children}
      </div>
    </div>
  );
}

export interface SiteFooterProps {
  /** `dataUpdatedAt` from the useQuery result — 0 before the first fetch
   * completes, so guard with `> 0` rather than `!== undefined`. */
  updatedAt?: number;
}

export function SiteFooter({ updatedAt }: SiteFooterProps) {
  return (
    <footer className="mx-auto max-w-3xl px-4 pt-10 pb-12 sm:px-8">
      <div className="grid gap-8 border-t border-fjord-700 pt-8 sm:grid-cols-3">
        <Group title="Om">
          <p>
            Spotpris time for time i alle fem norske prisområder, med hva du
            faktisk betaler etter mva, påslag og nettleie.
          </p>
          <p>
            Et hobbyprosjekt — ikke en offisiell priskilde. Sjekk alltid din
            egen strømavtale.
          </p>
          <p>
            Nettleie og påslag er plassholdere — juster dem i Innstillinger for
            å matche din egen nettleverandør og avtale.
          </p>
        </Group>

        <Group title="Data">
          <p>
            Spotpriser fra{" "}
            <ExternalLink href="https://www.hvakosterstrommen.no">
              hvakosterstrommen.no
            </ExternalLink>
            , hentet fra ENTSO-E og omregnet til kroner med siste vekslingskurs
            fra Norges Bank.
          </p>
          <p>
            Prisene er uten strømstøtte. NO4 er fritatt for mva. Morgendagens
            priser publiseres rundt kl. 13:00.
          </p>
          {updatedAt !== undefined && updatedAt > 0 && (
            <p>
              Sist hentet{" "}
              <time
                dateTime={new Date(updatedAt).toISOString()}
                className="font-mono text-frost"
              >
                {new Intl.DateTimeFormat("nb-NO", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "Europe/Oslo",
                }).format(updatedAt)}
              </time>
            </p>
          )}
        </Group>

        <Group title="Kolofon">
          <p>
            Laget av <span className="text-frost">Hammad Khan</span> med React,
            TypeScript og Tailwind.
          </p>
          <p>
            <ExternalLink href={GITHUB_URL}>Kildekode på GitHub</ExternalLink>
          </p>
          <p>
            <ExternalLink href={LINKEDIN_URL}>LinkedIn</ExternalLink>
          </p>
        </Group>
      </div>

      <p className="mt-8 text-center text-xs text-mist">
        © {new Date().getFullYear()} Hammad Khan
      </p>
    </footer>
  );
}
