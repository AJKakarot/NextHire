import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { fileToDataUri, handleApiError, json, parseForm } from "@/lib/server/http";
import { uploadToCloudinary } from "@/lib/server/upload";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    const { file } = await parseForm(request);

    if (!file) {
      throw new ApiError(400, "No pdf file provided");
    }

    const uploadResult = await uploadToCloudinary(
      await fileToDataUri(file),
      user.resume_public_id
    );

    const [updatedUser] = await sql`
      UPDATE users SET resume = ${uploadResult.url}, resume_public_id = ${uploadResult.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, resume;
    `;

    return json({
      message: "Resume updated",
      updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
