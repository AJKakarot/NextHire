import axios from "axios";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { forgotPasswordTemplate } from "../templete.js";
import { sendMail } from "../utils/sendMail.js";
import { redisClient } from "../utils/redis.js";

export const registerUser = TryCatch(async (req, res, next) => {
  const { name, email, password, phoneNumber, role, bio } = req.body;

  if (!name || !email || !password || !phoneNumber || !role) {
    throw new ErrorHandler(400, "Please fill all details");
  }

  const existingUsers =
    await sql`SELECT user_id FROM users WHERE email = ${email}`;

  if (existingUsers.length > 0) {
    throw new ErrorHandler(409, "User with this email already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  let registeredUser;

  if (role === "recruiter") {
    const [user] =
      await sql`INSERT INTO users (name, email, password, phone_number, role) VALUES 
               (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}) RETURNING user_id, name, email, phone_number, role, created_at`;

    registeredUser = user;
  } else if (role === "jobseeker") {
    const file = req.file;

    if (!file) {
      throw new ErrorHandler(400, "Resume file is required for jobseekers");
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "Failed to generate buffer");
    }

    if (!process.env.UPLOAD_SERVICE) {
      throw new ErrorHandler(500, "UPLOAD_SERVICE is not configured");
    }

    let data: { url: string; public_id: string };
    try {
      const uploadRes = await axios.post(
        `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
        { buffer: fileBuffer.content },
        { timeout: 60000 }
      );
      data = uploadRes.data;
    } catch (error: any) {
      throw new ErrorHandler(
        503,
        error.response?.data?.message ||
          "Resume upload failed. Set Auth UPLOAD_SERVICE to the Utils URL."
      );
    }

    const [user] =
      await sql`INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id) VALUES 
               (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id}) RETURNING user_id, name, email, phone_number, role, bio, resume, created_at`;

    registeredUser = user;
  } else {
    throw new ErrorHandler(400, "Invalid role");
  }

  const token = jwt.sign(
    { id: registeredUser?.user_id },
    process.env.JWT_SEC as string,
    {
      expiresIn: "15d",
    }
  );

  res.json({
    message: "user Registered",
    registeredUser,
    token,
  });
});

export const loginUser = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler(400, "Please fill all details");
  }

  const user = await sql`
  SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
  LEFT JOIN skills s ON us.skill_id = s.skill_id
  WHERE u.email = ${email} GROUP BY u.user_id;
  `;

  if (user.length === 0) {
    throw new ErrorHandler(400, "Invalid credentials");
  }

  const userObject = user[0];

  const matchPassword = await bcrypt.compare(password, userObject.password);

  if (!matchPassword) {
    throw new ErrorHandler(400, "Invalid credentials");
  }

  userObject.skills = userObject.skills || [];

  delete userObject.password;

  const token = jwt.sign(
    { id: userObject?.user_id },
    process.env.JWT_SEC as string,
    {
      expiresIn: "15d",
    }
  );

  res.json({
    message: "user Loggedin",
    userObject,
    token,
  });
});

export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new ErrorHandler(400, "email is required");
  }

  const users =
    await sql`SELECT user_id, email FROM users WHERE email = ${email}`;

  if (users.length === 0) {
    return res.json({
      message: "If that email exists, we have sent a reset link",
    });
  }
  const user = users[0];

  const resetToken = jwt.sign(
    {
      email: user.email,
      type: "reset",
    },
    process.env.JWT_SEC as string,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.Frontend_Url}/reset/${resetToken}`;

  await redisClient.set(`forgot:${email}`, resetToken, { ex: 900 });

  sendMail({
    to: email,
    subject: "RESET Your Password - nextHire",
    html: forgotPasswordTemplate(resetLink),
  }).catch((error) => {
    console.error("failed to send mail", error);
  });

  res.json({
    message: "If that email exists, we have sent a reset link",
  });
});

export const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const resetToken = Array.isArray(token) ? token[0] : token;

  let decoded: any;

  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SEC as string);
  } catch (error) {
    throw new ErrorHandler(400, "Expired token");
  }

  if (decoded.type !== "reset") {
    throw new ErrorHandler(400, "Invalid token type");
  }

  const email = decoded.email;

  const stroredToken = await redisClient.get(`forgot:${email}`);

  if (!stroredToken || stroredToken !== token) {
    throw new ErrorHandler(400, "token has been expired");
  }

  const users = await sql`SELECT user_id FROM users WHERE email = ${email}`;

  if (users.length === 0) {
    throw new ErrorHandler(404, "User not found");
  }

  const user = users[0];

  const hashPassword = await bcrypt.hash(password, 10);

  await sql`UPDATE users SET password = ${hashPassword} WHERE user_id = ${user.user_id}`;

  await redisClient.del(`forgot:${email}`);

  res.json({ message: "Password changed successfully" });
});
