import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { user } from "hub:db:schema";
import { formatUserResponse } from "~~/server/utils/user";
import type { UserResponse } from "#shared/types";

export default defineEventHandler(async (event): Promise<ApiResponse<UserResponse[]>> => {
  await requireAdmin(event);

  const query = getQuery(event);
  const limit = clampLimit(query.limit, { default: 10 });
  const offset = clampOffset(query.offset);

  const role = query.role;
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const pattern = `%${search}%`;
  const where = and(
    eq(user.banned, false),
    role === "admin" || role === "author" || role === "user" ? eq(user.role, role) : undefined,
    search
      ? or(
          ilike(user.name, pattern),
          ilike(user.firstName, pattern),
          ilike(user.lastName, pattern),
          ilike(user.email, pattern),
        )
      : undefined,
  );

  const [rows, totalRow] = await Promise.all([
    db.select().from(user).where(where).orderBy(desc(user.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(user).where(where),
  ]);

  return createResponse({ code: ApiResponseCode.Success }, rows.map(formatUserResponse), {
    total: Number(totalRow[0]?.value ?? 0),
    limit,
    offset,
  });
});
