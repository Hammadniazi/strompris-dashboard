import { useEffect, useState } from "react";
import type { z } from "zod";

/** Same as useState, but backed by localStorage and validated with a zod schema. */
export function usePersistedState<S extends z.ZodType>(
  key: string,
  schema: S,
  defaultValue: z.infer<S>,
) {
  const [value, setValue] = useState<z.infer<S>>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;
      return schema.parse(JSON.parse(stored));
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (private browsing, quota exceeded) — ignore.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
