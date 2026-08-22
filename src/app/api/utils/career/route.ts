import { handleApiError, json, readJson } from "@/lib/server/http";
import { generateJsonPrompt, parseLlmJson } from "@/lib/server/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { skills } = await readJson<{ skills?: unknown }>(request);

    if (!skills) {
      return json({ message: "Skills Required" }, 400);
    }

    const prompt = `
Based on the following skills: ${skills}.

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

    const response = await generateJsonPrompt(prompt);

    try {
      return json(parseLlmJson(response.text));
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
