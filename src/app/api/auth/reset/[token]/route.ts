import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/server/errors";
import { sql } from "@/lib/server/db";
import { normalizeEmail, verifyToken } from "@/lib/server/auth";
import { handleApiError, json, readJson } from "@/lib/server/http";
import { redisClient } from "@/lib/server/redis";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { password } = await readJson<{ password?: string }>(request);

    let decoded: { email?: string; type?: string };
    try {
      decoded = verifyToken(token) as { email?: string; type?: string };
    } catch {
      throw new ApiError(400, "Expired token");
    }

    if (decoded.type !== "reset") {
      throw new ApiError(400, "Invalid token type");
    }

    const email = normalizeEmail(decoded.email);
    const storedToken = await redisClient.get(`forgot:${email}`);

    if (!storedToken || storedToken !== token) {
      throw new ApiError(400, "token has been expired");
    }

    const users = await sql`SELECT user_id FROM users WHERE LOWER(email) = ${email}`;

    if (users.length === 0) {
      throw new ApiError(404, "User not found");
    }

    const hashPassword = await bcrypt.hash(password || "", 10);
    await sql`UPDATE users SET password = ${hashPassword} WHERE user_id = ${users[0].user_id}`;
    await redisClient.del(`forgot:${email}`);

    return json({ message: "Password changed successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
