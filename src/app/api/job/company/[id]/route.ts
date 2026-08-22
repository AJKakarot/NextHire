import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw new ApiError(400, "Company id is required");
    }

    const [companyData] = await sql`SELECT c.*, COALESCE (
     (
       SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
      ),
      '[]'::json
    ) AS jobs
     FROM companies c WHERE c.company_id = ${id} GROUP BY c.company_id;`;

    if (!companyData) {
      throw new ApiError(404, "Company not found");
    }

    return json(companyData);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    const [company] =
      await sql`SELECT logo_public_id FROM companies WHERE company_id = ${id} AND recruiter_id = ${user.user_id}`;

    if (!company) {
      throw new ApiError(
        404,
        "Company not found or you're not authorized to delete it."
      );
    }

    await sql`DELETE FROM companies WHERE company_id = ${id}`;

    return json({
      message: "Company and all associated jobs have been deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
