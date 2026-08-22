import { sql } from "@/lib/server/db";
import { handleApiError, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "";
    const location = searchParams.get("location") || "";

    let queryString = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type, j.role, j.work_location, j.created_at, c.name AS company_name, c.logo AS company_logo, c.company_id AS company_id FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;
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

    const jobs = (await sql.query(queryString, values)) as unknown[];
    return json(jobs);
  } catch (error) {
    return handleApiError(error);
  }
}
