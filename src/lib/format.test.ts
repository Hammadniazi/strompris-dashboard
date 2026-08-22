import { describe, expect, it } from "vitest";
import { formatNok, formatOre } from "./format";

describe("formatOre", () => {
  it("converts NOK/kWh to øre with up to one decimal", () => {
    expect(formatOre(1.403)).toBe("140,3 øre");
  });

  it("drops trailing zeros for whole øre values", () => {
    expect(formatOre(1.4)).toBe("140 øre");
  });
});

describe("formatNok", () => {
  it("formats as Norwegian currency", () => {
    // nb-NO currency formatting uses a non-breaking space before "kr".
    expect(formatNok(2.43).replace(" ", " ")).toBe("2,43 kr");
  });
});
