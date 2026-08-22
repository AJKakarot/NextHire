import { requireUser } from "@/lib/server/auth";
import { sql } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { handleApiError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    const { skillName } = await readJson<{ skillName?: string }>(request);

    if (!skillName || skillName.trim() === "") {
      throw new ApiError(400, "Please provide a skill name");
    }

    const result = await sql`DELETE FROM user_skills WHERE user_id = ${
      user.user_id
    } AND skill_id = (SELECT skill_id FROM skills WHERE name = ${skillName.trim()}) RETURNING user_id;`;

    if (result.length === 0) {
      throw new ApiError(404, `Skill ${skillName.trim()} was not found`);
    }

    return json({
      message: `Skill ${skillName.trim()} was deleted successfully`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
