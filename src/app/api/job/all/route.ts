import { sql } from "@/lib/server/db";
import { filterExternalJobs, getExternalJobs } from "@/lib/server/external-jobs";
import { handleApiError, json } from "@/lib/server/http";
import { isIndiaJob } from "@/lib/jobs";
import { Job } from "@/type";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "";
    const location = searchParams.get("location") || "";

    let queryString = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type, j.role, j.work_location, j.created_at, j.openings, j.is_active, c.name AS company_name, c.logo AS company_logo, c.company_id AS company_id FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;
    const values: string[] = [];
    let paramIndex = 1;

    if (title) {
      queryString += ` AND j.title ILIKE $${paramIndex}`;
      values.push(`%${title}%`);
      paramIndex++;
    }

    if (location) {
      queryString += ` AND j.location ILIKE $${paramIndex}`;
      values.push(`%${location}%`);
    }

    queryString += " ORDER BY j.created_at DESC";

    const localJobs = ((await sql.query(queryString, values)) as Job[]).map(
      (job) => ({ ...job, source: "nexthire" as const })
    );

    let externalJobs: Job[] = [];
    try {
      externalJobs = filterExternalJobs(await getExternalJobs(), title, location);
    } catch (error) {
      console.error("external jobs fetch failed", error);
    }

    const indiaJobs = externalJobs.filter(isIndiaJob);
    const otherJobs = externalJobs.filter((job) => !isIndiaJob(job));

    return json([...localJobs, ...indiaJobs, ...otherJobs]);
  } catch (error) {
    return handleApiError(error);
  }
}
