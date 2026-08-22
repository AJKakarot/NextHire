import { requireRecruiter } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireRecruiter(request);
    const {
      title,
      description,
      salary,
      location,
      role,
      job_type,
      work_location,
      company_id,
      openings,
    } = await readJson<{
      title?: string;
      description?: string;
      salary?: number;
      location?: string;
      role?: string;
      job_type?: string;
      work_location?: string;
      company_id?: number;
      openings?: number;
    }>(request);

    if (!title || !description || !salary || !location || !role || !openings) {
      throw new ApiError(400, "All the fields required");
    }

    const [company] =
      await sql`SELECT company_id FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}`;

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const [newJob] =
      await sql`INSERT INTO jobs (title, description, salary, location, role, job_type, work_location, company_id, posted_by_recuriter_id, openings) VALUES (${title}, ${description}, ${salary}, ${location}, ${role}, ${job_type}, ${work_location}, ${company_id}, ${user.user_id}, ${openings}) RETURNING *`;

    return json({
      message: "Job posted successfully",
      job: newJob,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
