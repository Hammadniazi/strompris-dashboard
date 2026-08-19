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
