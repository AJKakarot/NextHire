import dotenv from "dotenv";
dotenv.config();

import express from "express";
import authRoutes from "./routes/auth.js";
import cors from "cors";

const app = express();

const extraOrigins = (process.env.Frontend_Url || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://next-hire-8gup.vercel.app",
  "https://next-hire-sand.vercel.app",
  ...extraOrigins,
]);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;
