import { count, desc, eq } from "drizzle-orm";
import { shoppingLists, user } from "hub:db:schema";

export default defineEventHandler(async (event): Promise<ApiResponse<ShoppingListResponse[]>> => {
  await requireAdmin(event);
  const query = getQuery(event);
  const limit = clampLimit(query.limit, { default: 10 });
  const offset = clampOffset(query.offset);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({ plan: shoppingLists, name: user.name, email: user.email, image: user.image })
      .from(shoppingLists)
      .innerJoin(user, eq(shoppingLists.userId, user.id))
      .orderBy(desc(shoppingLists.createdAt), desc(shoppingLists.id))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(shoppingLists),
  ]);
  return createResponse(
    { code: ApiResponseCode.Success },
    rows.map(({ plan, name, email, image }) => ({
      id: plan.id,
      userId: plan.userId,
      userName: name,
      userEmail: email,
      userAvatar: image ?? undefined,
      createdAt: plan.createdAt.toISOString(),
      items: plan.items,
    })),
    { total: totalRow?.value ?? 0, limit, offset },
  );
});
