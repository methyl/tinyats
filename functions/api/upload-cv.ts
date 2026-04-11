import { init, id } from "@instantdb/admin";
import schema from "../../src/instant.schema";

interface Env {
  AI: Ai;
  INSTANT_APP_ID: string;
  INSTANT_ADMIN_TOKEN: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
    if (!context.env.INSTANT_APP_ID || !context.env.INSTANT_ADMIN_TOKEN) {
      return jsonResponse(
        { error: "Server misconfiguration: INSTANT_APP_ID and INSTANT_ADMIN_TOKEN must be set" },
        500
      );
    }

    const formData = await context.request.formData();
    const file = formData.get("file") as File | null;
    const positionId = formData.get("positionId") as string | null;

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

    // Init InstantDB admin
    const adminDb = init({
      appId: context.env.INSTANT_APP_ID,
      adminToken: context.env.INSTANT_ADMIN_TOKEN,
      schema,
    });

    // Create candidate immediately with "Processing" status so the
    // frontend kanban shows it right away via real-time subscription
    const candidateId = id();
    const now = Date.now();
    const placeholderName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");

    const createTx = adminDb.tx.candidates[candidateId].update({
      name: placeholderName,
      email: "",
      status: "Processing",
      rating: 0,
      dateAdded: now,
      sortOrder: now,
      activityLevel: "recent",
    });

    if (positionId) {
      await adminDb.transact(createTx.link({ position: positionId }));
    } else {
      await adminDb.transact(createTx);
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
      // Update candidate to New with whatever we have
      await adminDb.transact(
        adminDb.tx.candidates[candidateId].update({ status: "New" })
      );
      return jsonResponse({ candidateId, warning: "Could not extract text from file" });
    }

    // Extract structured data with AI
    const aiResponse = (await context.env.AI.run(
      "@cf/google/gemma-4-26b-a4b-it" as BaseAiTextGenerationModels,
      {
        messages: [
          { role: "user", content: EXTRACTION_PROMPT + markdownContent + "\n---" },
        ],
        max_tokens: 512,
        temperature: 0.1,
      }
    )) as AiTextGenerationOutput;

    let candidateData: {
      name: string;
      email: string;
      phone: string | null;
      linkedin: string | null;
      github: string | null;
      note: string | null;
    };

    try {
      const responseText =
        "response" in aiResponse ? (aiResponse as { response: string }).response : "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      candidateData = JSON.parse(jsonMatch[0]);
    } catch {
      // Couldn't parse AI response — move to New status with placeholder data
      await adminDb.transact(
        adminDb.tx.candidates[candidateId].update({ status: "New" })
      );
      return jsonResponse({
        candidateId,
        warning: "Could not parse candidate data from CV",
      });
    }

    // Update candidate with extracted data and move to "New"
    await adminDb.transact(
      adminDb.tx.candidates[candidateId].update({
        name: candidateData.name || placeholderName,
        email: candidateData.email || "",
        phone: candidateData.phone ?? undefined,
        linkedin: candidateData.linkedin ?? undefined,
        github: candidateData.github ?? undefined,
        note: candidateData.note ?? undefined,
        status: "New",
      })
    );

    return jsonResponse({ success: true, candidateId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
};
