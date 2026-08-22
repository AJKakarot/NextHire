import express from "express";
import authRoutes from "./routes/auth.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.Frontend_Url,
    ].filter(Boolean) as string[],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;
