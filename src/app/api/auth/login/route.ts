import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/server/errors";
import { sql } from "@/lib/server/db";
import { signAuthToken } from "@/lib/server/auth";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password } = await readJson<{
      email?: string;
      password?: string;
    }>(request);

    if (!email || !password) {
      throw new ApiError(400, "Please fill all details");
    }

    const user = await sql`
      SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.skill_id
      WHERE u.email = ${email} GROUP BY u.user_id;
    `;

    if (user.length === 0) {
      throw new ApiError(400, "Invalid credentials");
    }

    const userObject = user[0] as Record<string, unknown>;
    const matchPassword = await bcrypt.compare(
      password,
      userObject.password as string
    );

    if (!matchPassword) {
      throw new ApiError(400, "Invalid credentials");
    }

    userObject.skills = userObject.skills || [];
    delete userObject.password;

    const token = signAuthToken(userObject.user_id as number);

    return json({
      message: "user Loggedin",
      userObject,
      token,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
