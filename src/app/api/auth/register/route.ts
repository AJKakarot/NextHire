import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/server/errors";
import { sql } from "@/lib/server/db";
import { normalizeEmail, signAuthToken } from "@/lib/server/auth";
import { fileToDataUri, handleApiError, json, parseForm } from "@/lib/server/http";
import { uploadToCloudinary } from "@/lib/server/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { fields, file } = await parseForm(request);
    const { name, email, password, phoneNumber, role, bio } = fields;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password || !phoneNumber || !role) {
      throw new ApiError(400, "Please fill all details");
    }

    const existingUsers =
      await sql`SELECT user_id FROM users WHERE LOWER(email) = ${normalizedEmail}`;

    if (existingUsers.length > 0) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    let registeredUser;

    if (role === "recruiter") {
      const [user] =
        await sql`INSERT INTO users (name, email, password, phone_number, role) VALUES 
                 (${name}, ${normalizedEmail}, ${hashPassword}, ${phoneNumber}, ${role}) RETURNING user_id, name, email, phone_number, role, created_at`;
      registeredUser = user;
    } else if (role === "jobseeker") {
      if (!file) {
        throw new ApiError(400, "Resume file is required for jobseekers");
      }

      const dataUri = await fileToDataUri(file);
      const data = await uploadToCloudinary(dataUri);

      const [user] =
        await sql`INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id) VALUES 
                 (${name}, ${normalizedEmail}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio || null}, ${data.url}, ${data.public_id}) RETURNING user_id, name, email, phone_number, role, bio, resume, created_at`;
      registeredUser = user;
    } else {
      throw new ApiError(400, "Invalid role");
    }

    const token = signAuthToken(registeredUser.user_id);

    return json({
      message: "user Registered",
      registeredUser,
      token,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
