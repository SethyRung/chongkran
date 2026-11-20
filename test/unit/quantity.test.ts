import { describe, expect, it } from "vitest";
import { scaleQuantity } from "../../shared/utils/quantity";

describe("scaleQuantity", () => {
  it("scales attached units and mixed fractions", () => {
    expect(scaleQuantity("350g", 2)).toBe("700 g");
    expect(scaleQuantity("1 1/2 cups", 3)).toBe("4.5 cups");
  });

  it("preserves ambiguous quantities and the original 1× text", () => {
    expect(scaleQuantity("2–3 tbsp", 2)).toBe("2–3 tbsp");
    expect(scaleQuantity("to taste", 4)).toBe("to taste");
    expect(scaleQuantity("350g", 1)).toBe("350g");
  });
});
