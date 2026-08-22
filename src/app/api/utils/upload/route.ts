import { handleApiError, json, readJson } from "@/lib/server/http";
import { uploadToCloudinary } from "@/lib/server/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { buffer, public_id } = await readJson<{
      buffer?: string;
      public_id?: string;
    }>(request);

    if (!buffer) {
      return json({ message: "buffer is required" }, 400);
    }

    const cloud = await uploadToCloudinary(buffer, public_id);
    return json(cloud);
  } catch (error) {
    return handleApiError(error);
  }
}
