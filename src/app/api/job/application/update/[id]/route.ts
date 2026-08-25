import { requireRecruiter } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { appUrl, handleApiError, json, readJson } from "@/lib/server/http";
import { sendMail } from "@/lib/server/mail";
import { applicationStatusUpdateTemplate } from "@/lib/server/templates";

export const runtime = "nodejs";

const STATUSES = ["Submitted", "Rejected", "Hired"] as const;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRecruiter(request);
    const { id } = await params;
    const { status } = await readJson<{ status?: string }>(request);

    if (!status || !STATUSES.includes(status as (typeof STATUSES)[number])) {
      throw new ApiError(400, "Please give a valid status");
    }

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

    const [applicant] =
      await sql`SELECT name, email FROM users WHERE user_id = ${application.applicant_id}`;

    const to = application.applicant_email || applicant?.email;
    const subject =
      status === "Hired"
        ? `You were hired for ${job.title}`
        : status === "Rejected"
          ? `Update on your ${job.title} application`
          : `Application update — ${job.title}`;

    if (to) {
      sendMail({
        to,
        subject,
        html: applicationStatusUpdateTemplate({
          name: applicant?.name || "",
          jobTitle: job.title,
          status,
          accountUrl: `${appUrl(request)}/account`,
        }),
      }).catch((error) => {
        console.error("Failed to send mail", error);
      });
    }

    return json({
      message:
        status === "Hired"
          ? "Applicant hired. They will get an email."
          : "Application updated. The applicant will get an email.",
      job,
      updatedApplication,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
