import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "./db";
import { ApiError } from "./errors";

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || "";
}

export type AuthUser = {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: "jobseeker" | "recruiter";
  bio: string | null;
  resume: string | null;
  resume_public_id: string | null;
  profile_pic: string | null;
  profile_pic_public_id: string | null;
  skills: string[];
  subscription: string | null;
};

export function signAuthToken(userId: number) {
  return jwt.sign({ id: userId }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });
}

export function signResetToken(email: string) {
  return jwt.sign(
    { email, type: "reset" },
    process.env.JWT_SEC as string,
    { expiresIn: "15m" }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization header is missing or invalid");
  }

  const token = authHeader.split(" ")[1];

  let decoded: JwtPayload;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, "Authentication Failed. Please login again");
  }

  if (!decoded?.id) {
    throw new ApiError(401, "Invalid Token");
  }

  const users = await sql`
    SELECT u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription,
    ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills
    FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    WHERE u.user_id = ${decoded.id}
    GROUP BY u.user_id;
  `;

  if (users.length === 0) {
    throw new ApiError(401, "User associated with this token no longer exists.");
  }

  const user = users[0] as AuthUser;
  user.skills = user.skills || [];
  return user;
}

export async function requireRecruiter(request: Request) {
  const user = await requireUser(request);
  if (user.role !== "recruiter") {
    throw new ApiError(403, "Forbidden: Only recruiter can access this");
  }
  return user;
}

export async function requireJobseeker(request: Request) {
  const user = await requireUser(request);
  if (user.role !== "jobseeker") {
    throw new ApiError(403, "Forbidden you are not allowed for this api");
  }
  return user;
}
