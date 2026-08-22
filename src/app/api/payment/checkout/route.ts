import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json } from "@/lib/server/http";
import { getRazorpay } from "@/lib/server/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authUser = await requireUser(request);
    const [user] =
      await sql`SELECT * FROM users WHERE user_id = ${authUser.user_id}`;

    const subTime = user?.subscription
      ? new Date(user.subscription).getTime()
      : 0;
    const isSubscribed = subTime > Date.now();

    if (isSubscribed) {
      throw new ApiError(400, "You already have a subscription");
    }

    const order = await getRazorpay().orders.create({
      amount: Number(119 * 100),
      currency: "INR",
      notes: {
        user_id: authUser.user_id.toString(),
      },
    });

    return json({ order }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
