interface Env {
  AI: Ai;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Truncate markdown to fit within model context window
const MAX_MARKDOWN_CHARS = 12000;

const EXTRACTION_PROMPT = `You are a precise CV/resume data extractor. Parse the following CV content and extract candidate information.

Return ONLY a valid JSON object with exactly these fields:
- "name" (string, required): The candidate's full name
- "email" (string, required): Email address. Use empty string "" if not found.
- "phone" (string or null): Phone number including country code if present
- "linkedin" (string or null): Full LinkedIn profile URL
- "github" (string or null): Full GitHub profile URL
- "note" (string or null): A concise 1-2 sentence professional summary highlighting key skills and years of experience

Important rules:
- Return ONLY the JSON object, no markdown, no explanation
- Use null for fields that are not found in the CV
- For LinkedIn/GitHub, return the full URL (e.g., "https://linkedin.com/in/...")
- Do not invent or hallucinate data that is not in the CV

CV Content:
---
`;

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonResponse({ error: "No file provided" }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonResponse(
        { error: "Unsupported file type. Please upload a PDF or DOCX." },
        400
      );
    }

    if (file.size > MAX_SIZE) {
      return jsonResponse({ error: "File too large. Maximum 10MB." }, 400);
    }

    // Convert file to markdown
    const fileBytes = await file.arrayBuffer();
    const markdownResults = await context.env.AI.toMarkdown([
      {
        name: file.name,
        blob: new Blob([fileBytes], { type: file.type }),
      },
    ]);

    const markdownContent = markdownResults[0]?.data;
    if (!markdownContent) {
      return jsonResponse({ error: "Could not extract text from file." }, 422);
    }

    // Truncate to fit model context
    const truncated = markdownContent.length > MAX_MARKDOWN_CHARS
      ? markdownContent.slice(0, MAX_MARKDOWN_CHARS) + "\n[truncated]"
      : markdownContent;

    // Extract structured data with AI
    const aiResponse = await context.env.AI.run(
      "@cf/google/gemma-4-26b-a4b-it" as BaseAiTextGenerationModels,
      {
        messages: [
          { role: "user", content: EXTRACTION_PROMPT + truncated + "\n---" },
        ],
        max_tokens: 16384,
        temperature: 0.1,
      }
    );

    // TODO: remove debug fields before production
    const raw = JSON.stringify(aiResponse);

    // Handle both Cloudflare AI response formats:
    // 1. Standard: { response: string }
    // 2. OpenAI-compatible (e.g. gemma-4): { choices: [{ message: { content, reasoning } }] }
    let responseText = "";
    if (typeof aiResponse === "object" && aiResponse !== null) {
      const resp = aiResponse as Record<string, unknown>;
      if ("response" in resp) {
        responseText = String(resp.response);
      } else if ("choices" in resp && Array.isArray(resp.choices)) {
        const choice = resp.choices[0] as Record<string, unknown> | undefined;
        const message = choice?.message as Record<string, unknown> | undefined;
        responseText = String(message?.content ?? message?.reasoning ?? "");
      }
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return jsonResponse({
        error: "Could not extract candidate data from CV.",
        debug: { markdownLength: markdownContent.length, markdown: truncated, aiResponse: raw },
      }, 422);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return jsonResponse({
      name: parsed.name || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      linkedin: parsed.linkedin || null,
      github: parsed.github || null,
      note: parsed.note || null,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: "Something went wrong processing the CV. Please try again.", debug: detail }, 500);
  }
};
