import { eq } from "drizzle-orm";
import { z } from "zod";
import { recipes, reviews, user } from "hub:db:schema";
import type { UserResponse } from "#shared/types";
import { formatUserResponse } from "~~/server/utils/user";

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.email().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  avatar: z.string().trim().min(1).optional(),
  bio: z.string().max(300).optional(),
});

export default defineEventHandler(async (event): Promise<ApiResponse<UserResponse>> => {
  const id = getRouterParam(event, "id");
  if (!id) {
    return createResponse({ code: ApiResponseCode.InvalidRequest, message: "User id is required" });
  }

  const { user: sessionUser } = await requireSession(event);

  if (sessionUser.role !== "admin" && sessionUser.id !== id) {
    return createResponse({
      code: ApiResponseCode.Forbidden,
      message: "Sorry, you don't have permission to update this user's information.",
    });
  }

  const body = await readValidatedBody(event, updateUserSchema.parse);

  const updates: Partial<typeof user.$inferInsert> = {};
  if (body.firstName !== undefined) updates.firstName = body.firstName;
  if (body.lastName !== undefined) updates.lastName = body.lastName;
  if (body.email !== undefined) updates.email = body.email;
  if (body.gender !== undefined) updates.gender = body.gender;
  if (body.dateOfBirth !== undefined) {
    updates.dateOfBirth = body.dateOfBirth;
  }

  if (body.avatar !== undefined) updates.image = body.avatar;
  if (body.bio !== undefined) updates.bio = body.bio;

  if (Object.keys(updates).length === 0) {
    return createResponse({ code: ApiResponseCode.InvalidRequest, message: "No fields to update" });
  }

  const row = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(user).where(eq(user.id, id)).for("update");
    if (!existing) return null;
    const name =
      `${updates.firstName ?? existing.firstName ?? ""} ${updates.lastName ?? existing.lastName ?? ""}`.trim() ||
      existing.name;
    const [updated] = await tx
      .update(user)
      .set({ ...updates, name })
      .where(eq(user.id, id))
      .returning();
    if (!updated) return null;
    if (existing.name !== name || body.avatar !== undefined || body.bio !== undefined) {
      await tx
        .update(recipes)
        .set({ authorName: name, authorAvatar: updated.image, authorBio: updated.bio })
        .where(eq(recipes.author, id));
      await tx
        .update(reviews)
        .set({ userName: name, userAvatar: updated.image })
        .where(eq(reviews.userId, id));
    }
    return updated;
  });
  if (!row) {
    return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" });
  }

  await refreshSessionCookieCache(event);

  return createResponse({ code: ApiResponseCode.Success }, formatUserResponse(row));
});
