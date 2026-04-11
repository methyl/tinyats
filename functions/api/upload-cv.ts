import { init } from "@instantdb/admin";
import schema from "../../src/instant.schema";

interface Env {
  AI: Ai;
  INSTANT_APP_ID: string;
  INSTANT_ADMIN_TOKEN: string;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const formData = await context.request.formData();
  const file = formData.get("file") as File | null;
  const candidateId = formData.get("candidateId") as string | null;

  if (!file || !candidateId) {
    return jsonResponse({ error: "file and candidateId are required" }, 400);
  }

  const adminDb = init({
    appId: context.env.INSTANT_APP_ID,
    adminToken: context.env.INSTANT_ADMIN_TOKEN,
    schema,
  });

  try {
    // Call parse-cv worker
    const parseForm = new FormData();
    parseForm.append("file", file);

    const origin = new URL(context.request.url).origin;
    const parseResponse = await fetch(`${origin}/api/parse-cv`, {
      method: "POST",
      body: parseForm,
    });

    if (!parseResponse.ok) {
      // Parsing failed — move candidate out of Processing
      await adminDb.transact(
        adminDb.tx.candidates[candidateId].update({ status: "New" })
      );
      return jsonResponse({ error: "Could not process CV." }, 422);
    }

    const data = (await parseResponse.json()) as {
      name: string | null;
      email: string | null;
      phone: string | null;
      linkedin: string | null;
      github: string | null;
      note: string | null;
    };

    // Update candidate with extracted data
    await adminDb.transact(
      adminDb.tx.candidates[candidateId].update({
        name: data.name || undefined,
        email: data.email || "",
        phone: data.phone || undefined,
        linkedin: data.linkedin || undefined,
        github: data.github || undefined,
        note: data.note || undefined,
        status: "New",
      })
    );

    return jsonResponse({ success: true, candidateId });
  } catch (err) {
    console.error("upload-cv error:", err);
    // Best-effort: move out of Processing so it's not stuck
    try {
      await adminDb.transact(
        adminDb.tx.candidates[candidateId].update({ status: "New" })
      );
    } catch {}
    return jsonResponse({ error: "Something went wrong processing the CV. Please try again." }, 500);
  }
};
