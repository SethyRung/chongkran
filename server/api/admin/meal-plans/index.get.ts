import { count, desc, eq } from "drizzle-orm";
import { mealPlans, user } from "hub:db:schema";

export default defineEventHandler(async (event): Promise<ApiResponse<MealPlanResponse[]>> => {
  await requireAdmin(event);
  const query = getQuery(event);
  const limit = clampLimit(query.limit, { default: 10 });
  const offset = clampOffset(query.offset);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({ plan: mealPlans, name: user.name, email: user.email, image: user.image })
      .from(mealPlans)
      .innerJoin(user, eq(mealPlans.userId, user.id))
      .orderBy(desc(mealPlans.createdAt), desc(mealPlans.id))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(mealPlans),
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
      title: plan.title,
      recipes: plan.recipes,
      updatedAt: plan.updatedAt.toISOString(),
    })),
    { total: totalRow?.value ?? 0, limit, offset },
  );
});
