import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: [
    "bcryptjs",
    "cloudinary",
    "nodemailer",
    "razorpay",
    "@neondatabase/serverless",
    "@upstash/redis",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
