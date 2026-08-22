import { requireRecruiter } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { fileToDataUri, handleApiError, json, parseForm } from "@/lib/server/http";
import { uploadToCloudinary } from "@/lib/server/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireRecruiter(request);
    const { fields, file } = await parseForm(request);
    const { name, description, website } = fields;

    if (!name || !description || !website) {
      throw new ApiError(400, "All the fields required");
    }

    const existingCompanies =
      await sql`SELECT company_id FROM companies WHERE name = ${name}`;

    if (existingCompanies.length > 0) {
      throw new ApiError(409, `A company with the name ${name} already exists`);
    }

    if (!file) {
      throw new ApiError(400, "Company Logo file is required");
    }

    const data = await uploadToCloudinary(await fileToDataUri(file));

    const [newCompany] =
      await sql`INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user.user_id}) RETURNING *`;

    return json({
      message: "Company created successfully",
      company: newCompany,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
