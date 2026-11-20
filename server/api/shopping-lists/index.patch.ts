import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { shoppingLists } from "hub:db:schema";
import type { ShoppingListResponse } from "#shared/types";

const updateShoppingListSchema = z.object({
  items: z.array(shoppingItemSchema),
  previousItems: z.array(shoppingItemSchema).optional(),
});

export default defineEventHandler(async (event): Promise<ApiResponse<ShoppingListResponse>> => {
  const { user: sessionUser } = await requireSession(event);

  const body = await readValidatedBody(event, updateShoppingListSchema.parse);

  const [row] = await db
    .update(shoppingLists)
    .set({ items: body.items })
    .where(
      and(
        eq(shoppingLists.userId, sessionUser.id),
        body.previousItems
          ? sql`${shoppingLists.items} = ${JSON.stringify(body.previousItems)}::jsonb`
          : undefined,
      ),
    )
    .returning();

  if (!row) {
    return createResponse({
      code: ApiResponseCode.NotFound,
      message: body.previousItems
        ? "The list changed. Reloaded the latest items."
        : "List not found",
    });
  }

  return createResponse(
    { code: ApiResponseCode.Success },
    {
      id: row.id,
      userId: row.userId,
      items: row.items,
      createdAt: row.createdAt.toISOString(),
    },
  );
});
