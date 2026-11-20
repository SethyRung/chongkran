export default defineEventHandler(async (event): Promise<ApiResponse<ShoppingItem[]>> => {
  const { user } = await requireSession(event);
  const id = getRouterParam(event, "id");
  if (!id) return createResponse({ code: ApiResponseCode.InvalidRequest });
  const ingredients = await getPlanIngredients(id, user.id);
  return ingredients
    ? createResponse({ code: ApiResponseCode.Success }, ingredients)
    : createResponse({ code: ApiResponseCode.NotFound, message: "Meal plan not found" });
});
