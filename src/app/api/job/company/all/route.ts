import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { handleApiError, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const companies =
      await sql`SELECT * FROM companies WHERE recruiter_id = ${user.user_id}`;
    return json(companies);
  } catch (error) {
    return handleApiError(error);
  }
}
