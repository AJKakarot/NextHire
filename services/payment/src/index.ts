import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

const razorpayKeyId =
  process.env.Razorpay_Key || process.env.razorpay_key_id;
const razorpayKeySecret =
  process.env.Razorpay_Secret || process.env.razorpay_key_secret;

export const instance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Payment Service is running on ${process.env.PORT}`);
});
