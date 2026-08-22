import { ApiError } from "@/lib/server/errors";
import { sql } from "@/lib/server/db";
import { signResetToken } from "@/lib/server/auth";
import { appUrl, handleApiError, json, readJson } from "@/lib/server/http";
import { sendMail } from "@/lib/server/mail";
import { redisClient } from "@/lib/server/redis";
import { forgotPasswordTemplate } from "@/lib/server/templates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email } = await readJson<{ email?: string }>(request);

    if (!email) {
      throw new ApiError(400, "email is required");
    }

    const users =
      await sql`SELECT user_id, email FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return json({
        message: "If that email exists, we have sent a reset link",
      });
    }

    const user = users[0];
    const resetToken = signResetToken(user.email);
    const resetLink = `${appUrl(request)}/reset/${resetToken}`;

    try {
      await redisClient.set(`forgot:${email}`, resetToken, { ex: 900 });
    } catch (error) {
      console.error("failed to store reset token", error);
      throw new ApiError(500, "Reset token store failed. Check Upstash Redis.");
    }

    try {
      await sendMail({
        to: email,
        subject: "RESET Your Password - nextHire",
        html: forgotPasswordTemplate(resetLink),
      });
    } catch (error: unknown) {
      console.error("failed to send mail", error);
      const smtpMessage =
        error instanceof Error ? error.message : "SMTP error";
      throw new ApiError(500, `Could not send reset email: ${smtpMessage}`);
    }

    return json({
      message: "If that email exists, we have sent a reset link",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
