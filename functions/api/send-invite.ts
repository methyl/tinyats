import { init } from "@instantdb/admin";
import schema from "../../src/instant.schema";

interface Env {
  INSTANT_APP_ID: string;
  INSTANT_ADMIN_TOKEN: string;
  RESEND_API_KEY: string;
  INVITE_FROM_EMAIL?: string;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const db = init({
    appId: env.INSTANT_APP_ID,
    adminToken: env.INSTANT_ADMIN_TOKEN,
    schema,
  });

  // Verify caller
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  let caller;
  try {
    caller = await db.auth.verifyToken(authHeader.slice(7));
  } catch {
    return jsonResponse({ error: "Invalid token" }, 401);
  }

  const { inviteId } = (await request.json()) as { inviteId: string };
  if (!inviteId) {
    return jsonResponse({ error: "inviteId required" }, 400);
  }

  // Lookup invite with related data
  const { invites } = await db.query({
    invites: {
      $: { where: { id: inviteId } },
      organization: {},
      workspace: {},
      inviter: {},
    },
  });

  const invite = invites[0];
  if (!invite) {
    return jsonResponse({ error: "Invite not found" }, 404);
  }
  if (invite.status !== "pending" && invite.status !== "sent") {
    return jsonResponse({ error: `Invite already ${invite.status}` }, 409);
  }

  // Verify caller is an org member
  const { orgMemberships } = await db.query({
    orgMemberships: {
      $: {
        where: {
          "organization.id": (invite as any).organization?.id,
          "user.id": caller.id,
        },
      },
    },
  });
  if (orgMemberships.length === 0) {
    return jsonResponse({ error: "Not an org member" }, 403);
  }

  // Build accept URL
  const origin = new URL(request.url).origin;
  const acceptUrl = `${origin}/invite/${inviteId}`;

  const orgName = (invite as any).organization?.name ?? "an organization";
  const wsName = (invite as any).workspace?.name ?? "a workspace";
  const inviterEmail = (invite as any).inviter?.email ?? "Someone";
  const fromEmail = env.INVITE_FROM_EMAIL || "noreply@example.com";

  // Send email via Resend
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `TinyATS <${fromEmail}>`,
      to: [invite.email],
      subject: `You've been invited to ${orgName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111; margin-bottom: 8px;">
            You're invited to ${orgName}
          </h2>
          <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 24px;">
            ${inviterEmail} invited you to join <strong>${wsName}</strong> with <strong>${invite.level}</strong> access.
          </p>
          <a href="${acceptUrl}" style="display: inline-block; padding: 10px 24px; background: #111; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Accept Invite
          </a>
          <p style="font-size: 12px; color: #999; margin-top: 32px;">
            Or copy this link: ${acceptUrl}
          </p>
        </div>
      `,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error("Resend error:", err);
    return jsonResponse({ error: "Failed to send email" }, 502);
  }

  // Mark invite as sent
  await db.transact([db.tx.invites[inviteId].update({ status: "sent" })]);

  return jsonResponse({ ok: true });
};
