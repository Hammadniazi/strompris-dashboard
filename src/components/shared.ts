import type { FocusEvent } from "react";

export const LEVEL_TEXT = {
  cheap: "text-cheap",
  normal: "text-normal",
  expensive: "text-expensive",
} as const;

export const LEVEL_DOT = {
  cheap: "bg-cheap",
  normal: "bg-normal",
  expensive: "bg-expensive",
} as const;

// text-base (16px), not text-sm (14px): iOS Safari auto-zooms the whole
// page in on focus for any input under 16px, which felt broken on mobile.
export const inputClass =
  "h-11 rounded-md border border-fjord-700 bg-fjord-950 px-3 font-mono text-base text-frost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cheap/50";

/** Select the existing value on focus, so tapping a small number field on
 * mobile replaces it by typing instead of inserting into/after the old
 * digits (there's no visible cursor-position feedback to guide that on a
 * touch keyboard). */
export function selectOnFocus(e: FocusEvent<HTMLInputElement>) {
  e.target.select();
}
