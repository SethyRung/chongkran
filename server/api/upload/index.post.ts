import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import type { UploadResponse } from "#shared/types";

export default defineEventHandler(async (event): Promise<ApiResponse<UploadResponse>> => {
  const { user: sessionUser } = await requireSession(event);
  const form = await readMultipartFormData(event);
  const file = form?.find((part) => part.name === "file");
  if (!file?.data.length || file.data.length > 2 * 1024 * 1024) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "Select an image up to 2 MB.",
    });
  }

  const extension = imageExtension(file.data);
  if (!extension) {
    return createResponse({
      code: ApiResponseCode.InvalidRequest,
      message: "Choose a PNG, JPEG, GIF or WebP image.",
    });
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  try {
    if (import.meta.dev && !token) {
      await mkdir(localUploadDirectory, { recursive: true });
      await writeFile(join(localUploadDirectory, filename), file.data, { flag: "wx" });
      return createResponse(
        { code: ApiResponseCode.Success },
        { public_id: filename, url: `/api/upload/${filename}` },
      );
    }

    if (!token) throw new Error("Missing upload configuration");
    const blob = await put(`recipes/${sessionUser.id}/${filename}`, file.data, {
      access: "public",
      contentType: uploadContentTypes[extension],
      token,
    });

    return createResponse(
      { code: ApiResponseCode.Success },
      { public_id: blob.pathname, url: blob.url },
    );
  } catch {
    return createResponse({
      code: ApiResponseCode.InternalError,
      message: "Image upload failed. Try again.",
    });
  }
});
