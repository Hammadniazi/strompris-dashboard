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
          aria-pressed={day === d}
          onClick={() => onChange(d)}
          className={`flex h-9 items-center justify-center rounded-full px-4 capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50 ${
            day === d ? "bg-selected text-frost" : "text-mist hover:text-frost"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
