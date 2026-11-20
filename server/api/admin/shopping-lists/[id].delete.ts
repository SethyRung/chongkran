import { eq } from "drizzle-orm";
import { shoppingLists } from "hub:db:schema";

export default defineEventHandler(async (event): Promise<ApiResponse<string>> => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) return createResponse({ code: ApiResponseCode.InvalidRequest });
  const [deleted] = await db
    .delete(shoppingLists)
    .where(eq(shoppingLists.id, id))
    .returning({ id: shoppingLists.id });
  return deleted
    ? createResponse({ code: ApiResponseCode.Success }, deleted.id)
    : createResponse({ code: ApiResponseCode.NotFound });
});
