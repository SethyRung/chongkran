export const localUploadDirectory = ".data/uploads";

export const uploadContentTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

export function imageExtension(data: Buffer) {
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (data.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return "jpg";
  if (["GIF87a", "GIF89a"].includes(data.toString("ascii", 0, 6))) return "gif";
  if (data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP")
    return "webp";
}
