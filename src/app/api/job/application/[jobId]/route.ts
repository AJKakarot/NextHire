import { requireRecruiter } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await requireRecruiter(request);
    const { jobId } = await params;

    const [job] = await sql`
      SELECT posted_by_recuriter_id FROM jobs WHERE job_id = ${jobId}
    `;

    if (!job) {
      throw new ApiError(404, "job not found");
    }

    if (job.posted_by_recuriter_id !== user.user_id) {
      throw new ApiError(403, "Forbidden you are not allowed");
    }

    const applications = await sql`
      SELECT a.*, u.name AS applicant_name, u.profile_pic AS applicant_pic
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.user_id
      WHERE a.job_id = ${jobId}
      ORDER BY a.subscribed DESC, a.applied_at ASC
    `;

    return json(applications);
  } catch (error) {
    return handleApiError(error);
  }
}
