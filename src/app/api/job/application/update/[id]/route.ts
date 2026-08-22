import { requireRecruiter } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json, readJson } from "@/lib/server/http";
import { sendMail } from "@/lib/server/mail";
import { applicationStatusUpdateTemplate } from "@/lib/server/templates";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRecruiter(request);
    const { id } = await params;
    const { status } = await readJson<{ status?: string }>(request);

    const [application] =
      await sql`SELECT * FROM applications WHERE application_id = ${id}`;

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    const [job] =
      await sql`SELECT posted_by_recuriter_id, title FROM jobs WHERE job_id = ${application.job_id}`;

    if (!job) {
      throw new ApiError(404, "no job with this id");
    }

    if (job.posted_by_recuriter_id !== user.user_id) {
      throw new ApiError(403, "Forbidden you are not allowed");
    }

    const [updatedApplication] =
      await sql`UPDATE applications SET status = ${status} WHERE application_id = ${id} RETURNING *`;

    sendMail({
      to: application.applicant_email,
      subject: "Application Update - Job portal",
      html: applicationStatusUpdateTemplate(job.title),
    }).catch((error) => {
      console.error("Failed to send mail", error);
    });

    return json({
      message: "Application updated",
      job,
      updatedApplication,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
