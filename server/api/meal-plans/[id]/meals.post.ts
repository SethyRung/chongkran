import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { mealPlans, recipes } from "hub:db:schema";
import { mealPlanDays, mealPlanTypes } from "#shared/utils/meal-plan";

const schema = z.object({
  recipeId: z.string().min(1),
  day: z.enum(mealPlanDays),
  mealType: z.enum(mealPlanTypes),
  quantity: z.number().int().min(1).max(10),
});

export default defineEventHandler(async (event): Promise<ApiResponse<string>> => {
  const { user } = await requireSession(event);
  const id = getRouterParam(event, "id");
  if (!id) return createResponse({ code: ApiResponseCode.InvalidRequest });
  const meal = await readValidatedBody(event, schema.parse);
  const [recipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(and(eq(recipes.id, meal.recipeId), eq(recipes.status, "approved")))
    .limit(1);
  if (!recipe)
    return createResponse({ code: ApiResponseCode.NotFound, message: "Recipe not found" });

  const owner = and(eq(mealPlans.id, id), eq(mealPlans.userId, user.id));
  const [updated] = await db
    .update(mealPlans)
    .set({
      recipes: sql`${mealPlans.recipes} || ${JSON.stringify([meal])}::jsonb`,
      updatedAt: new Date(),
    })
    .where(
      and(
        owner,
        sql`not exists (
      select 1 from jsonb_array_elements(${mealPlans.recipes}) as entry
      where entry->>'day' = ${meal.day} and entry->>'mealType' = ${meal.mealType}
    )`,
      ),
    )
    .returning({ id: mealPlans.id });

  if (updated) return createResponse({ code: ApiResponseCode.Success }, updated.id);
  const [plan] = await db.select({ id: mealPlans.id }).from(mealPlans).where(owner).limit(1);
  return plan
    ? createResponse({
        code: ApiResponseCode.InvalidRequest,
        message: "That meal slot is already filled.",
      })
    : createResponse({ code: ApiResponseCode.NotFound, message: "Meal plan not found." });
});
