import { describe, expect, it } from "vitest";
import type { ShoppingItem } from "../../shared/types/shopping-list";
import { applyPlanIngredients } from "../../shared/utils/plan-shopping";

function fish(quantity: string, planId?: string, checked = false): ShoppingItem {
  return {
    name: "White fish",
    quantity,
    checked,
    source: planId ? { planId, recipes: [{ id: "amok", title: "Fish amok" }] } : undefined,
  };
}

describe("applyPlanIngredients", () => {
  it("allocates manual stock once across multiple plans and makes add missing repeatable", () => {
    const first = applyPlanIngredients([fish("100 g")], [fish("150 g", "a")], "a", "missing");
    expect(first.map(({ quantity }) => quantity)).toEqual(["100 g", "50 g"]);
    expect(applyPlanIngredients(first, [fish("150 g", "a")], "a", "missing")).toEqual(first);

    const second = applyPlanIngredients(first, [fish("125 g", "b")], "b", "missing");
    expect(second.map(({ quantity }) => quantity)).toEqual(["100 g", "50 g", "125 g"]);
  });

  it("keeps purchases and other plans while replacing unchecked contributions", () => {
    const existing = [fish("25 g", "a", true), fish("150 g", "a"), fish("100 g", "b")];
    const result = applyPlanIngredients(existing, [fish("75 g", "a")], "a", "sync");
    expect(result).toEqual([fish("25 g", "a", true), fish("100 g", "b"), fish("50 g", "a")]);
  });
});
