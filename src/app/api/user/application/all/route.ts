import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { handleApiError, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const applications = await sql`
      SELECT a.*, j.title AS job_title, j.salary AS job_salary, j.location AS job_location FROM applications a JOIN jobs j ON a.job_id = j.job_id WHERE a.applicant_id = ${user.user_id}
    `;
    return json(applications);
  } catch (error) {
    return handleApiError(error);
  }
}
