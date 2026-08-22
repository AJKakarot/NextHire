import { requireUser } from "@/lib/server/auth";
import { handleApiError, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    return json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
