import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { skillName } = await readJson<{ skillName?: string }>(request);

    if (!skillName || skillName.trim() === "") {
      throw new ApiError(400, "Please provide a skill name");
    }

    let wasSkillAdded = false;

    try {
      await sql`BEGIN`;

      const [skill] =
        await sql`INSERT INTO skills (name) VALUES (${skillName.trim()}) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING skill_id`;

      const insertionResult =
        await sql`INSERT INTO user_skills (user_id, skill_id) VALUES (${user.user_id}, ${skill.skill_id}) ON CONFLICT (user_id, skill_id) DO NOTHING RETURNING user_id`;

      if (insertionResult.length > 0) {
        wasSkillAdded = true;
      }

      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }

    if (!wasSkillAdded) {
      return json({ message: "User already possesses this skill" });
    }

    return json({
      message: `Skill ${skillName.trim()} is added successfully`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
