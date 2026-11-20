import { and, asc, count, desc, eq, ilike, lte, or, sql } from "drizzle-orm";
import { recipeLikes, recipes } from "hub:db:schema";
import { aggregateLikesForRecipes, formatRecipeResponse } from "~~/server/utils/recipe";
import type { RecipeResponse } from "#shared/types";

export default defineEventHandler(async (event): Promise<ApiResponse<RecipeResponse[]>> => {
  const query = getQuery(event);
  const limit = clampLimit(query.limit, { default: 10 });
  const offset = clampOffset(query.offset);
  const search = typeof query.search === "string" ? query.search.trim() : "";

  const pattern = `%${search}%`;
  const time = Number(query.maxTime);
  const difficulty = query.difficulty;
  const adminScope = query.scope === "admin";
  if (adminScope) await requireAdmin(event);
  const status = adminScope ? query.status : "approved";
  const where = and(
    search
      ? or(
          ilike(recipes.title, pattern),
          ilike(recipes.description, pattern),
          sql`exists (select 1 from jsonb_array_elements(${recipes.ingredients}) as ingredient
                       where ingredient->>'name' ilike ${pattern})`,
          sql`exists (select 1 from unnest(${recipes.tags}) as tag where tag ilike ${pattern})`,
        )
      : undefined,
    typeof query.category === "string" && query.category
      ? eq(recipes.category, query.category)
      : undefined,
    difficulty === "easy" || difficulty === "medium" || difficulty === "hard"
      ? eq(recipes.difficulty, difficulty)
      : undefined,
    typeof query.maxTime === "string" && Number.isInteger(time) && time > 0
      ? lte(recipes.cookTime, time)
      : undefined,
    status === "approved" || status === "pending" || status === "rejected"
      ? eq(recipes.status, status)
      : undefined,
  );
  const sorts = {
    oldest: asc(recipes.createdAt),
    newest: desc(recipes.createdAt),
    popular: desc(recipes.views),
    quickest: asc(recipes.cookTime),
    liked: desc(
      sql`(select count(*) from ${recipeLikes} where ${recipeLikes.recipeId} = ${recipes.id})`,
    ),
  };
  const sort =
    typeof query.sort === "string" && Object.hasOwn(sorts, query.sort)
      ? sorts[query.sort as keyof typeof sorts]
      : sorts.newest;

  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(recipes)
      .where(where)
      .orderBy(sort, desc(recipes.id))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(recipes).where(where),
  ]);

  const likesMap = await aggregateLikesForRecipes(rows.map((r) => r.id));

  return createResponse(
    { code: ApiResponseCode.Success },
    rows.map((row) => formatRecipeResponse(row, likesMap.get(row.id))),
    { total: Number(totalRow[0]?.value ?? 0), limit, offset },
  );
});
