import crypto from "crypto";
import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await readJson<{
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      }>(request);

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        (process.env.Razorpay_Secret ||
          process.env.razorpay_key_secret) as string
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return json({ message: "Payment Failed" }, 400);
    }

    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const [updatedUser] =
      await sql`UPDATE users SET subscription = ${expiryDate} WHERE user_id = ${user.user_id} RETURNING *`;

    return json({
      message: "Subscription Purchased Successfully",
      updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
