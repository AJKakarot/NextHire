import { handleApiError, json, readJson } from "@/lib/server/http";
import { extractPdfText, generateJsonPrompt, parseLlmJson } from "@/lib/server/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { pdfBase64 } = await readJson<{ pdfBase64?: string }>(request);

    if (!pdfBase64) {
      return json({ message: "PDF data is required" }, 400);
    }

    const resumeText = await extractPdfText(pdfBase64);

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
and provide:
1. An ATS compatibility score (0-100)
2. Detailed suggestions to improve the resume for better ATS performance

Resume text:
"""
${resumeText}
"""

Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.

The JSON object should have the following structure:
{
  "atsScore": 85,
  "scoreBreakdown": {
    "formatting": { "score": 90, "feedback": "Brief feedback on formatting" },
    "keywords": { "score": 80, "feedback": "Brief feedback on keyword usage" },
    "structure": { "score": 85, "feedback": "Brief feedback on resume structure" },
    "readability": { "score": 88, "feedback": "Brief feedback on readability" }
  },
  "suggestions": [
    {
      "category": "Category name (e.g., 'Formatting', 'Content', 'Keywords', 'Structure')",
      "issue": "Description of the issue found",
      "recommendation": "Specific actionable recommendation to fix it",
      "priority": "high/medium/low"
    }
  ],
  "strengths": [ "List of things the resume does well for ATS" ],
  "summary": "A brief 2-3 sentence summary of the overall ATS performance"
}

Focus on: - File format and structure compatibility - Proper use of standard section headings - Keyword optimization - Formatting issues (tables, columns, graphics, special characters) - Contact information placement - Date formatting - Use of action verbs and quantifiable achievements - Section organization and flow
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
