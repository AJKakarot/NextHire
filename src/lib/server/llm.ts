function llmConfig() {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: groqKey,
      model:
        process.env.GROQ_MODEL ||
        process.env.LLM_MODEL ||
        "llama-3.3-70b-versatile",
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      key: openAiKey,
      model: process.env.OPENAI_MODEL || process.env.LLM_MODEL || "gpt-4o-mini",
    };
  }

  throw new Error(
    "Add GROQ_API_KEY (Groq) or OPENAI_API_KEY (ChatGPT) in .env.local"
  );
}

export async function generateJsonPrompt(prompt: string) {
  const { url, key, model } = llmConfig();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a career and resume assistant. Reply with valid JSON only. Do not wrap the JSON in markdown.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const payload = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!res.ok) {
    throw new Error(payload.error?.message || `LLM request failed (${res.status})`);
  }

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Ai did not return a valid text response.");
  }

  return { text };
}

export function parseLlmJson(raw?: string | null) {
  const rawText = raw?.replace(/```json/g, "").replace(/```/g, "").trim();

  if (!rawText) {
    throw new Error("Ai did not return a valid text response.");
  }

  return JSON.parse(rawText);
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

  return text.slice(0, 20000);
}
