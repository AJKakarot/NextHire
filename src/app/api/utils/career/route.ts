import { handleApiError, json, readJson } from "@/lib/server/http";
import { generateJsonPrompt, parseLlmJson } from "@/lib/server/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeCareerGuide(raw: unknown) {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const jobOptions = asArray<Record<string, unknown>>(
    data.jobOptions || data.job_options
  ).map((job) => ({
    title: String(job.title || job.role || "Recommended role"),
    responsibilities: String(job.responsibilities || job.description || ""),
    why: String(job.why || ""),
  }));

  const skillsRaw = asArray<unknown>(data.skillsToLearn || data.skills_to_learn);
  const skillsToLearn = skillsRaw.map((item) => {
    if (item && typeof item === "object" && "skills" in item) {
      const category = item as Record<string, unknown>;
      return {
        category: String(category.category || "Skills"),
        skills: asArray<Record<string, unknown>>(category.skills).map((skill) => ({
          title: String(skill.title || skill.name || ""),
          why: String(skill.why || ""),
          how: String(skill.how || ""),
        })),
      };
    }

    const skill = (item && typeof item === "object" ? item : {}) as Record<
      string,
      unknown
    >;
    return {
      category: "Skills to learn",
      skills: [
        {
          title: String(skill.title || skill.name || ""),
          why: String(skill.why || ""),
          how: String(skill.how || ""),
        },
      ],
    };
  });

  const approachRaw =
    data.learningApproach || data.learning_approach || data.approach;
  const approach =
    approachRaw && typeof approachRaw === "object"
      ? (approachRaw as Record<string, unknown>)
      : {};

  return {
    summary: String(data.summary || ""),
    jobOptions,
    skillsToLearn,
    learningApproach: {
      title: String(approach.title || "How to Approach Learning"),
      points: asArray<unknown>(approach.points || approach.tips).map((point) =>
        String(point)
      ),
    },
  };
}

export async function POST(request: Request) {
  try {
    const { skills, polish } = await readJson<{
      skills?: unknown;
      polish?: boolean;
    }>(request);

    if (!skills) {
      return json({ message: "Skills Required" }, 400);
    }

    const polishBlock = polish
      ? `

POLISH MODE (required):
- Return 3-4 jobOptions with sharp, market-ready titles.
- Each "how" must include one concrete project or resource.
- learningApproach.points must include a 30-day, 60-day, and 90-day action.
- Write like a senior career coach. No filler.
`
      : "";

    const prompt = `
Based on the following skills: ${skills}.${polishBlock}

Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.

The JSON object should have the following structure:
{
 "summary": "A brief, encouraging summary of the user's skill set and their general job title.",
 "jobOptions": [
 {
"title": "The name of the job role.",
"responsibilities": "A description of what the user would do in this role.",
"why": "An explanation of why this role is a good fit for their skills."
 }
 ],
 "skillsToLearn": [
 {
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack Mastery', 'DevOps & Cloud').",
"skills": [
 {
 "title": "The name of the skill to learn.",
 "why": "Why learning this skill is important.",
 "how": "Specific examples of how to learn or apply this skill."
 }
]
 }
 ],
 "learningApproach": {
"title": "How to Approach Learning",
"points": ["A bullet point list of actionable advice for learning."]
 }
}
`;

    const response = await generateJsonPrompt(prompt, { polish });

    try {
      return json(normalizeCareerGuide(parseLlmJson(response.text)));
    } catch {
      return json(
        {
          message: "Ai returned response that was not valid JSON",
          rawResponse: response.text,
        },
        500
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
