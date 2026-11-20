import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, "file") ?? "";
  const extension = filename.match(
    /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}\.(png|jpg|gif|webp)$/,
  )?.[1];
  if (!import.meta.dev || !extension)
    throw createError({ statusCode: 404, statusMessage: "Image not found" });

  try {
    const data = await readFile(join(localUploadDirectory, filename));
    setHeader(event, "Content-Type", uploadContentTypes[extension]!);
    setHeader(event, "X-Content-Type-Options", "nosniff");
    return data;
  } catch {
    throw createError({ statusCode: 404, statusMessage: "Image not found" });
  }
});
