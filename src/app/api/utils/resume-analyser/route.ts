import { handleApiError, json, readJson } from "@/lib/server/http";
import { extractPdfText, generateJsonPrompt, parseLlmJson } from "@/lib/server/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

const TEMPLATE_SCORES = {
  atsScore: 75,
  formatting: 80,
  keywords: 70,
  structure: 75,
  readability: 80,
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scorePair(value: unknown, fallbackScore: number, fallbackFeedback: string) {
  const item = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const feedback = String(item.feedback || "").trim();
  const copiedExample = feedback.toLowerCase() === "one short sentence";
  return {
    score: copiedExample ? fallbackScore : clampScore(Number(item.score ?? fallbackScore)),
    feedback: copiedExample || !feedback ? fallbackFeedback : feedback,
  };
}

function looksLikeTemplate(atsScore: number, breakdown: Record<string, { score: number }>) {
  return (
    atsScore === TEMPLATE_SCORES.atsScore &&
    breakdown.formatting.score === TEMPLATE_SCORES.formatting &&
    breakdown.keywords.score === TEMPLATE_SCORES.keywords &&
    breakdown.structure.score === TEMPLATE_SCORES.structure &&
    breakdown.readability.score === TEMPLATE_SCORES.readability
  );
}

function countMatches(text: string, words: string[]) {
  return words.filter((word) => text.includes(word)).length;
}

function heuristicResumeScores(resumeText: string, targetJob?: string, jobDescription?: string) {
  const text = resumeText.toLowerCase();
  const length = resumeText.length;
  const lines = resumeText.split(/\n/).filter((line) => line.trim()).length;

  let formatting = 42;
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText)) formatting += 16;
  if (/\+?\d[\d\s().-]{8,}\d/.test(resumeText)) formatting += 10;
  if (length > 500 && length < 9000) formatting += 12;
  else if (length > 200) formatting += 6;
  if (lines >= 18) formatting += 8;

  let structure = 38;
  const sections = ["experience", "education", "skills", "projects", "summary", "work history", "certification"];
  structure += countMatches(text, sections) * 8;

  let keywords = 40;
  const verbs = ["led", "built", "developed", "designed", "implemented", "created", "managed", "improved", "launched", "delivered", "owned"];
  keywords += Math.min(28, countMatches(text, verbs) * 4);
  const targetWords = `${targetJob || ""} ${jobDescription || ""}`
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((word) => word.length > 3);
  if (targetWords.length) {
    const overlap = countMatches(text, [...new Set(targetWords)].slice(0, 20));
    keywords += Math.round((overlap / Math.min(targetWords.length, 20)) * 22);
  } else if (/\b(javascript|typescript|python|java|react|node|sql|aws)\b/.test(text)) {
    keywords += 10;
  }

  let readability = 48;
  if (lines >= 12) readability += 12;
  if (/\d+%|\d+\+|\$\d+|\d{2,}/.test(resumeText)) readability += 14;
  if (resumeText !== resumeText.toUpperCase()) readability += 8;
  if (length > 800) readability += 6;

  const scores = {
    formatting: clampScore(formatting),
    keywords: clampScore(keywords),
    structure: clampScore(structure),
    readability: clampScore(readability),
  };

  return {
    ...scores,
    atsScore: clampScore(
      (scores.formatting + scores.keywords + scores.structure + scores.readability) / 4
    ),
  };
}

function normalizeResumeAnalysis(
  raw: unknown,
  resumeText: string,
  targetJob?: string,
  jobDescription?: string
) {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const breakdown =
    data.scoreBreakdown && typeof data.scoreBreakdown === "object"
      ? (data.scoreBreakdown as Record<string, unknown>)
      : {};
  const heuristic = heuristicResumeScores(resumeText, targetJob, jobDescription);

  const scoreBreakdown = {
    formatting: scorePair(
      breakdown.formatting,
      heuristic.formatting,
      "Contact details and a clean single-column layout help ATS parsers."
    ),
    keywords: scorePair(
      breakdown.keywords,
      heuristic.keywords,
      "Add role-specific skills and measurable outcomes from the job description."
    ),
    structure: scorePair(
      breakdown.structure,
      heuristic.structure,
      "Use standard headings like Experience, Skills, Education, and Projects."
    ),
    readability: scorePair(
      breakdown.readability,
      heuristic.readability,
      "Short bullets with numbers are easier for recruiters and ATS tools to scan."
    ),
  };

  const llmScore = clampScore(Number(data.atsScore ?? data.score ?? 0));
  const averageScore = clampScore(
    (scoreBreakdown.formatting.score +
      scoreBreakdown.keywords.score +
      scoreBreakdown.structure.score +
      scoreBreakdown.readability.score) /
      4
  );
  const usedTemplate = looksLikeTemplate(llmScore, scoreBreakdown);

  return {
    atsScore: usedTemplate ? heuristic.atsScore : averageScore || heuristic.atsScore,
    scoreBreakdown: usedTemplate
      ? {
          formatting: { ...scoreBreakdown.formatting, score: heuristic.formatting },
          keywords: { ...scoreBreakdown.keywords, score: heuristic.keywords },
          structure: { ...scoreBreakdown.structure, score: heuristic.structure },
          readability: { ...scoreBreakdown.readability, score: heuristic.readability },
        }
      : scoreBreakdown,
    suggestions: (Array.isArray(data.suggestions) ? data.suggestions : []).map((item) => {
      const suggestion = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        category: String(suggestion.category || "General"),
        issue: String(suggestion.issue || ""),
        recommendation: String(suggestion.recommendation || ""),
        priority: String(suggestion.priority || "medium"),
      };
    }),
    strengths: (Array.isArray(data.strengths) ? data.strengths : []).map((item) =>
      String(item)
    ),
    summary: String(data.summary || ""),
  };
}

export async function POST(request: Request) {
  try {
    const { pdfBase64, polish, targetJob, jobDescription } = await readJson<{
      pdfBase64?: string;
      polish?: boolean;
      targetJob?: string;
      jobDescription?: string;
    }>(request);

    if (!pdfBase64) {
      return json({ message: "PDF data is required" }, 400);
    }

    const resumeText = await extractPdfText(pdfBase64);
    const target = targetJob?.trim();
    const jd = jobDescription?.trim();

    const polishBlock = polish
      ? " Polish each recommendation into a ready-to-paste resume bullet. Name missing keywords."
      : "";

    const targetBlock =
      target || jd
        ? `\nTarget role: ${target || "not specified"}\nJob description: ${jd || "not provided"}\n`
        : "";

    const prompt = `Score THIS resume only. Do not reuse sample numbers. atsScore must be the rounded average of the four breakdown scores and should usually land between 45 and 92 unless the resume is empty or outstanding.

Analyze ATS compatibility.${targetBlock}${polishBlock}

Resume:
"""
${resumeText}
"""

Return JSON with this exact shape and keys:
{
  "atsScore": <integer 0-100>,
  "scoreBreakdown": {
    "formatting": { "score": <integer>, "feedback": "specific sentence about this resume" },
    "keywords": { "score": <integer>, "feedback": "specific sentence about this resume" },
    "structure": { "score": <integer>, "feedback": "specific sentence about this resume" },
    "readability": { "score": <integer>, "feedback": "specific sentence about this resume" }
  },
  "suggestions": [
    {
      "category": "Keywords",
      "issue": "what is missing in this resume",
      "recommendation": "how to fix it",
      "priority": "high"
    }
  ],
  "strengths": ["what this resume already does well"],
  "summary": "two specific sentences about this resume"
}

Rules: 3-5 suggestions, 3 strengths, keep every string under 180 characters.`;

    const response = await generateJsonPrompt(prompt, { polish });

    try {
      return json(
        normalizeResumeAnalysis(parseLlmJson(response.text), resumeText, target, jd)
      );
    } catch (error) {
      console.error("Resume JSON parse failed", error);
      return json(
        normalizeResumeAnalysis(
          {
            summary:
              "The model returned an incomplete analysis, so scores were calculated from the resume text.",
            strengths: [],
            suggestions: [],
          },
          resumeText,
          target,
          jd
        )
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
