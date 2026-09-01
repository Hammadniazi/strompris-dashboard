import {
  PRICE_ZONES,
  ZONE_META,
  type PriceZone,
} from "@/features/prices/types";

export interface ZonePickerProps {
  zone: PriceZone;
  onChange: (zone: PriceZone) => void;
}

export function ZonePicker({ zone, onChange }: ZonePickerProps) {
  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <p className="text-sm text-mist">
        {ZONE_META[zone].city} · {ZONE_META[zone].region}
      </p>
      <div className="relative">
        <select
          aria-label="Sone"
          className="h-11 appearance-none rounded-md border border-fjord-700 bg-fjord-850 pr-9 pl-3 text-sm text-frost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50"
          value={zone}
          onChange={(e) => onChange(e.target.value as PriceZone)}
        >
          {PRICE_ZONES.map((z) => (
            <option key={z} value={z}>
              {z} — {ZONE_META[z].city}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-mist"
        >
          ▾
        </span>
      </div>
    </div>
  );
}
