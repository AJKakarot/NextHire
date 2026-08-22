import Razorpay from "razorpay";

export function getRazorpay() {
  const key_id = process.env.Razorpay_Key || process.env.razorpay_key_id;
  const key_secret =
    process.env.Razorpay_Secret || process.env.razorpay_key_secret;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured");
  }

  return new Razorpay({ key_id, key_secret });
}
