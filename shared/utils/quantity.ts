export function parseQuantity(quantity: string) {
  const result = quantity
    .trim()
    .match(/^(?:(\d+)\s+)?(?:(\d+)\/(\d+)|(\d+(?:\.\d+)?))\s*([^\d]*)$/);
  if (!result) return null;
  const [, whole, numerator, denominator, decimal, unit = ""] = result;
  const amount =
    Number(whole ?? 0) + (decimal ? Number(decimal) : Number(numerator) / Number(denominator));
  return Number.isFinite(amount) ? { amount, unit: unit.trim() } : null;
}

export function formatQuantity(amount: number, unit: string) {
  return `${Number(amount.toFixed(6))}${unit ? ` ${unit}` : ""}`;
}

export function scaleQuantity(quantity: string, multiplier: number) {
  if (multiplier === 1) return quantity;
  const parsed = parseQuantity(quantity);
  return parsed ? formatQuantity(parsed.amount * multiplier, parsed.unit) : quantity;
}
