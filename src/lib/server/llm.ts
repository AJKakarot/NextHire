function llmConfig() {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    const model =
      process.env.GROQ_MODEL ||
      process.env.LLM_MODEL ||
      "openai/gpt-oss-20b";
    return {
      provider: "groq" as const,
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: groqKey,
      model,
      isGptOss: model.includes("gpt-oss"),
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    return {
      provider: "openai" as const,
      url: "https://api.openai.com/v1/chat/completions",
      key: openAiKey,
      model: process.env.OPENAI_MODEL || process.env.LLM_MODEL || "gpt-4o-mini",
      isGptOss: false,
    };
  }

  throw new Error(
    "Add GROQ_API_KEY (Groq) or OPENAI_API_KEY (ChatGPT) in .env.local"
  );
}

type LlmPayload = {
  error?: {
    message?: string;
    failed_generation?: string;
  };
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning?: string | null;
    };
    finish_reason?: string;
  }>;
};

function extractText(payload: LlmPayload) {
  const message = payload.choices?.[0]?.message;
  return (
    message?.content?.trim() ||
    payload.error?.failed_generation?.trim() ||
    ""
  );
}

async function requestLlm(prompt: string, polish: boolean, useJsonFormat: boolean) {
  const { url, key, model, provider, isGptOss } = llmConfig();
  const jsonMode = useJsonFormat && !isGptOss;

  const body: Record<string, unknown> = {
    model,
    temperature: polish ? 0.35 : 0.2,
    max_completion_tokens: 4096,
    messages: isGptOss
      ? [
          {
            role: "user",
            content: `${
              polish
                ? "You are a senior career coach and resume editor. Be specific and recruiter-ready."
                : "You are a career and resume assistant."
            }\nReply with a single valid JSON object only. No markdown. No extra text.\n\n${prompt}`,
          },
        ]
      : [
          {
            role: "system",
            content: polish
              ? "You are a senior career coach and resume editor. Be specific and recruiter-ready. Reply with a single valid JSON object only."
              : "You are a career and resume assistant. Reply with a single valid JSON object only.",
          },
          { role: "user", content: prompt },
        ],
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  if (provider === "groq" && isGptOss) {
    body.include_reasoning = false;
    body.reasoning_effort = "low";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await res.json()) as LlmPayload;
  const text = extractText(payload);

  if (!res.ok && !text) {
    throw new Error(payload.error?.message || `LLM request failed (${res.status})`);
  }

  return text;
}

function canParseJson(text: string) {
  try {
    parseLlmJson(text);
    return true;
  } catch {
    return false;
  }
}

export async function generateJsonPrompt(
  prompt: string,
  options?: { polish?: boolean }
) {
  const polish = Boolean(options?.polish);
  const { isGptOss } = llmConfig();

  let text = "";
  try {
    text = await requestLlm(prompt, polish, !isGptOss);
  } catch {
    text = "";
  }

  if (!text || !canParseJson(text)) {
    const fallback = await requestLlm(prompt, polish, false);
    if (fallback) {
      text = fallback;
    }
  }

  if (!text) {
    throw new Error("Ai did not return a valid text response.");
  }

  return { text };
}

function repairJson(raw: string) {
  return raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

export function parseLlmJson(raw?: string | null) {
  const rawText = repairJson(raw || "");

  if (!rawText) {
    throw new Error("Ai did not return a valid text response.");
  }

  const candidates = [rawText];
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start >= 0 && end > start) {
    candidates.push(rawText.slice(start, end + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(repairJson(candidate));
    } catch {
      // try next
    }
  }

  throw new Error("Ai returned response that was not valid JSON");
}

export async function extractPdfText(pdfBase64: string) {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const base64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  const pdf = await getDocumentProxy(bytes);
  const result = await extractText(pdf, { mergePages: true });
  const text = (Array.isArray(result.text) ? result.text.join("\n") : result.text)
    .replace(/\s+\n/g, "\n")
    .trim();

  if (!text) {
    throw new Error("Could not read text from this PDF. Try another file.");
  }

  return text.slice(0, 12000);
}
