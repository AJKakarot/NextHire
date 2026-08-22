import { requireJobseeker } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireJobseeker(request);

    if (!user.resume) {
      throw new ApiError(
        400,
        "You need to add resume in your profile to apply for this job"
      );
    }

    const { job_id } = await readJson<{ job_id?: number }>(request);

    if (!job_id) {
      throw new ApiError(400, "job id is required");
    }

    const [job] = await sql`SELECT is_active FROM jobs WHERE job_id = ${job_id}`;

    if (!job) {
      throw new ApiError(404, "No jobs with this id");
    }

    if (!job.is_active) {
      throw new ApiError(400, "Job is not active");
    }

    const now = Date.now();
    const subTime = user.subscription
      ? new Date(user.subscription).getTime()
      : 0;
    const isSubscribed = subTime > now;

    let newApplication;
    try {
      [newApplication] =
        await sql`INSERT INTO applications (job_id, applicant_id, applicant_email, resume, subscribed) VALUES (${job_id}, ${user.user_id}, ${user.email}, ${user.resume}, ${isSubscribed}) RETURNING *`;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error &&
        "code" in error &&
        (error as { code: string }).code === "23505"
      ) {
        throw new ApiError(409, "you have already applied to this job.");
      }
      throw error;
    }

    return json({
      message: "Applied for job successfully",
      application: newApplication,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
