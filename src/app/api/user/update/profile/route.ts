import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    const { name, phoneNumber, bio } = await readJson<{
      name?: string;
      phoneNumber?: string;
      bio?: string;
    }>(request);

    const [updatedUser] = await sql`
      UPDATE users SET name = ${name || user.name}, phone_number = ${phoneNumber || user.phone_number}, bio = ${bio || user.bio}
      WHERE user_id = ${user.user_id}
      RETURNING user_id, name, email, phone_number, bio
    `;

    return json({
      message: "Profile Updated successfully",
      updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
