import type { Ref } from "react";
import type { CostSettings } from "@/features/prices/utils";
import { inputClass, selectOnFocus } from "./shared";

export interface SettingsPanelProps {
  settings: CostSettings;
  onChange: (settings: CostSettings) => void;
  ref?: Ref<HTMLDetailsElement>;
}

export function SettingsPanel({ settings, onChange, ref }: SettingsPanelProps) {
  return (
    <details
      ref={ref}
      className="group mt-8 rounded-xl border border-fjord-700 bg-fjord-850"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-t-xl px-4 py-3 text-sm font-medium text-frost select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50 sm:px-5 [&::-webkit-details-marker]:hidden">
        Innstillinger
        <span className="text-mist transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="flex flex-wrap items-center gap-4 border-t border-fjord-700 px-4 py-4 text-sm text-mist sm:px-5">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50"
            checked={settings.includeVat}
            onChange={(e) =>
              onChange({ ...settings, includeVat: e.target.checked })
            }
          />
          Inkluder MVA
        </label>
        <label className="flex items-center gap-2">
          Påslag (øre/kWh)
          <input
            type="number"
            className={`w-16 ${inputClass}`}
            value={settings.paslagOre}
            onChange={(e) =>
              onChange({ ...settings, paslagOre: Number(e.target.value) })
            }
            onFocus={selectOnFocus}
          />
        </label>
        <label className="flex items-center gap-2">
          Nettleie (øre/kWh)
          <input
            type="number"
            className={`w-16 ${inputClass}`}
            value={settings.nettleieOre}
            onChange={(e) =>
              onChange({ ...settings, nettleieOre: Number(e.target.value) })
            }
            onFocus={selectOnFocus}
          />
        </label>
      </div>
    </details>
  );
}
