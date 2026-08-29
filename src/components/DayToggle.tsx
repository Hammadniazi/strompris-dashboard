import { tomorrowIsPublished } from "@/lib/time";

export interface DayToggleProps {
  day: "today" | "tomorrow";
  onChange: (day: "today" | "tomorrow") => void;
}

export function DayToggle({ day, onChange }: DayToggleProps) {
  return (
    <div className="inline-flex rounded-full border border-fjord-700 bg-fjord-850 p-1 text-sm">
      {(["today", "tomorrow"] as const).map((d) => (
        <button
          key={d}
          type="button"
          disabled={d === "tomorrow" && !tomorrowIsPublished()}
          onClick={() => onChange(d)}
          title={
            d === "tomorrow" && !tomorrowIsPublished()
              ? "Tomorrow's prices publish ~13:00 Oslo time"
              : undefined
          }
          className={`flex h-9 items-center justify-center rounded-full px-4 capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50 disabled:cursor-not-allowed disabled:opacity-30 ${
            day === d
              ? "bg-fjord-700 text-frost"
              : "text-mist hover:text-frost"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
