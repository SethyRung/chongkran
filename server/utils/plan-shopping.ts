import { and, eq, inArray } from "drizzle-orm";
import { mealPlans, recipes } from "hub:db:schema";
import { shoppingIngredientKey } from "#shared/utils/plan-shopping";
import { formatQuantity, parseQuantity, scaleQuantity } from "#shared/utils/quantity";

export async function getPlanIngredients(planId: string, userId: string) {
  const [plan] = await db
    .select({ entries: mealPlans.recipes })
    .from(mealPlans)
    .where(and(eq(mealPlans.id, planId), eq(mealPlans.userId, userId)))
    .limit(1);
  if (!plan) return null;

  const recipeIds = [...new Set(plan.entries.map(({ recipeId }) => recipeId))];
  const rows = recipeIds.length
    ? await db
        .select({ id: recipes.id, title: recipes.title, ingredients: recipes.ingredients })
        .from(recipes)
        .where(and(inArray(recipes.id, recipeIds), eq(recipes.status, "approved")))
    : [];
  const byId = new Map(rows.map((recipe) => [recipe.id, recipe]));
  const ingredients = new Map<string, ShoppingItem>();

  for (const entry of plan.entries) {
    const recipe = byId.get(entry.recipeId);
    if (!recipe) continue;
    for (const ingredient of recipe.ingredients) {
      const quantity = scaleQuantity(ingredient.quantity, entry.quantity ?? 1);
      const key = shoppingIngredientKey({ name: ingredient.name, quantity });
      const previous = ingredients.get(key);
      const amount = parseQuantity(quantity);
      const previousAmount = previous && parseQuantity(previous.quantity);
      const sources = previous?.source?.recipes ?? [];
      ingredients.set(key, {
        name: ingredient.name,
        checked: false,
        quantity:
          amount && previousAmount
            ? formatQuantity(previousAmount.amount + amount.amount, amount.unit)
            : quantity,
        source: {
          planId,
          recipes: sources.some((source) => source.id === recipe.id)
            ? sources
            : [...sources, { id: recipe.id, title: recipe.title }],
        },
      });
    }
  }

  return [...ingredients.values()];
}
