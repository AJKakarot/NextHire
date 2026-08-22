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
      throw new ApiError(400, "No image file provided");
    }

    const uploadResult = await uploadToCloudinary(
      await fileToDataUri(file),
      user.profile_pic_public_id
    );

    const [updatedUser] = await sql`
      UPDATE users SET profile_pic = ${uploadResult.url}, profile_pic_public_id = ${uploadResult.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, profile_pic;
    `;

    return json({
      message: "profile pic updated",
      updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
