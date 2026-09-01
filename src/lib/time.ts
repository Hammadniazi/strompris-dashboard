export const OSLO_TZ = "Europe/Oslo";

export function osloHourLabel(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: OSLO_TZ,
  }).format(new Date(iso));
}

/** Today in Oslo as 'YYYY-MM-DD' — NOT the user's local today. */
export function osloToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: OSLO_TZ }).format(now);
}

/** Tomorrow in Oslo as 'YYYY-MM-DD'. */
export function osloTomorrow(now = new Date()): string {
  // Adding a literal 24h in ms to `now` and re-reading the Oslo date breaks
  // across DST transitions, where an Oslo calendar day is 23 or 25 real
  // hours long. Instead, parse today's Oslo date and step the *calendar*
  // day forward in UTC — plain Y/M/D arithmetic that DST can't touch.
  const [year, month, day] = osloToday(now).split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(next);
}

/** Tomorrow's prices publish ~13:00 Oslo time. */
export function tomorrowIsPublished(now = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: OSLO_TZ,
    }).format(now),
  );
  return hour >= 13;
}
