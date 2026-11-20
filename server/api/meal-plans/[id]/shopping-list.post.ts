import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { shoppingLists } from "hub:db:schema";
import { applyPlanIngredients } from "#shared/utils/plan-shopping";

const schema = z.object({ mode: z.enum(["missing", "sync", "again"]) });

export default defineEventHandler(async (event): Promise<ApiResponse<ShoppingItem[]>> => {
  const { user } = await requireSession(event);
  const id = getRouterParam(event, "id");
  if (!id) return createResponse({ code: ApiResponseCode.InvalidRequest });
  const { mode } = await readValidatedBody(event, schema.parse);
  const incoming = await getPlanIngredients(id, user.id);
  if (!incoming)
    return createResponse({ code: ApiResponseCode.NotFound, message: "Meal plan not found" });
  const owner = eq(shoppingLists.userId, user.id);

  for (let attempt = 0; attempt < 4; attempt++) {
    const [current] = await db.select().from(shoppingLists).where(owner).limit(1);
    const items = applyPlanIngredients(current?.items ?? [], incoming, id, mode);
    const [saved] = current
      ? await db
          .update(shoppingLists)
          .set({ items })
          .where(and(owner, sql`${shoppingLists.items} = ${JSON.stringify(current.items)}::jsonb`))
          .returning({ items: shoppingLists.items })
      : await db
          .insert(shoppingLists)
          .values({ id: crypto.randomUUID(), userId: user.id, items })
          .onConflictDoNothing({ target: shoppingLists.userId })
          .returning({ items: shoppingLists.items });
    if (saved) return createResponse({ code: ApiResponseCode.Success }, saved.items);
  }
  return createResponse({
    code: ApiResponseCode.InvalidRequest,
    message: "The shopping list changed. Try again.",
  });
});
