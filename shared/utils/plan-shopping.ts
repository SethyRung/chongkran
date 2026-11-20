import type { ShoppingItem } from "../types/shopping-list";
import { formatQuantity, parseQuantity } from "./quantity";

export function shoppingIngredientKey(item: Pick<ShoppingItem, "name" | "quantity">) {
  const quantity = parseQuantity(item.quantity);
  const unit = quantity ? `unit:${quantity.unit}` : `text:${item.quantity.trim()}`;
  return JSON.stringify([item.name.trim().toLowerCase(), unit.toLowerCase()]);
}

export function applyPlanIngredients(
  existing: ShoppingItem[],
  incoming: ShoppingItem[],
  planId: string,
  mode: "missing" | "sync" | "again",
) {
  if (mode === "again") return [...existing, ...incoming];

  const items =
    mode === "sync"
      ? existing
          .filter((item) => item.checked || item.source?.planId !== planId)
          .map((item) =>
            item.allocations?.some((allocation) => allocation.planId === planId)
              ? {
                  ...item,
                  allocations: item.allocations.filter(
                    (allocation) => allocation.planId !== planId,
                  ),
                }
              : item,
          )
      : [...existing];
  const additions: ShoppingItem[] = [];

  for (const ingredient of incoming) {
    const key = shoppingIngredientKey(ingredient);
    const amount = parseQuantity(ingredient.quantity);
    const matches = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => shoppingIngredientKey(item) === key);
    let remaining = amount?.amount ?? 1;

    for (const { item } of matches) {
      if (item.source?.planId === planId) remaining -= parseQuantity(item.quantity)?.amount ?? 1;
      else if (!item.source)
        remaining -=
          item.allocations?.find((allocation) => allocation.planId === planId)?.amount ?? 0;
    }

    for (const { item, index } of matches) {
      if (remaining <= 0.000001 || item.source) continue;
      const allocated = item.allocations ?? [];
      const quantity = parseQuantity(item.quantity)?.amount ?? 1;
      const used = allocated.reduce((sum, allocation) => sum + allocation.amount, 0);
      const available = Math.min(remaining, quantity - used);
      if (available <= 0.000001) continue;
      remaining -= available;
      const own = allocated.find((allocation) => allocation.planId === planId);
      items[index] = {
        ...item,
        allocations: [
          ...allocated.filter((allocation) => allocation.planId !== planId),
          { planId, amount: (own?.amount ?? 0) + available },
        ],
      };
    }

    if (remaining > 0.000001) {
      const quantity =
        amount && remaining !== amount.amount
          ? formatQuantity(remaining, amount.unit)
          : ingredient.quantity;
      additions.push({ ...ingredient, quantity });
    }
  }

  return [...items, ...additions];
}
