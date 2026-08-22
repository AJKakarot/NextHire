import { requireRecruiter } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const [job] = await sql`SELECT * FROM jobs WHERE job_id = ${jobId}`;

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return json(job);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await requireRecruiter(request);
    const { jobId } = await params;
    const {
      title,
      description,
      salary,
      location,
      role,
      job_type,
      work_location,
      openings,
      is_active,
    } = await readJson<{
      title?: string;
      description?: string;
      salary?: number;
      location?: string;
      role?: string;
      job_type?: string;
      work_location?: string;
      openings?: number;
      is_active?: boolean;
    }>(request);

    const [existingJob] =
      await sql`SELECT posted_by_recuriter_id FROM jobs WHERE job_id = ${jobId}`;

    if (!existingJob) {
      throw new ApiError(404, "Job not found");
    }

    if (existingJob.posted_by_recuriter_id !== user.user_id) {
      throw new ApiError(403, "Forbiden: You are not allowed");
    }

    const [updatedJob] = await sql`UPDATE jobs SET title = ${title},
      description = ${description},
      salary = ${salary},
      location = ${location},
      role = ${role},
      job_type = ${job_type},
      work_location = ${work_location},
      openings = ${openings},
      is_active = ${is_active}
      WHERE job_id = ${jobId} RETURNING *;
    `;

    return json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await requireRecruiter(request);
    const { jobId } = await params;

    const [existingJob] =
      await sql`SELECT posted_by_recuriter_id FROM jobs WHERE job_id = ${jobId}`;

    if (!existingJob) {
      throw new ApiError(404, "Job not found");
    }

    if (existingJob.posted_by_recuriter_id !== user.user_id) {
      throw new ApiError(403, "Forbiden: You are not allowed");
    }

    await sql`DELETE FROM jobs WHERE job_id = ${jobId}`;

    return json({ message: "Job deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
