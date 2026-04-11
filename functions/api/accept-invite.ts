import { init, id } from "@instantdb/admin";
import schema from "../../src/instant.schema";

interface Env {
  INSTANT_APP_ID: string;
  INSTANT_ADMIN_TOKEN: string;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type AccessLevel = "read" | "comment" | "edit";

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

  // Lookup invite
  const { invites } = await db.query({
    invites: {
      $: { where: { id: inviteId } },
      organization: {},
      workspace: {},
    },
  });

  const invite = invites[0];
  if (!invite) {
    return jsonResponse({ error: "Invite not found" }, 404);
  }
  if (invite.status === "accepted") {
    return jsonResponse({ error: "Invite already accepted" }, 409);
  }
  if (invite.status !== "sent" && invite.status !== "pending") {
    return jsonResponse({ error: `Invite status: ${invite.status}` }, 409);
  }

  // Verify email matches
  if (caller.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return jsonResponse({ error: "Email mismatch" }, 403);
  }

  const orgId = (invite as any).organization?.id;
  const wsId = (invite as any).workspace?.id;
  if (!orgId || !wsId) {
    return jsonResponse({ error: "Invite missing org/workspace" }, 500);
  }

  // Check if already an org member
  const { orgMemberships: existing } = await db.query({
    orgMemberships: {
      $: { where: { "organization.id": orgId, "user.id": caller.id } },
    },
  });

  const level = invite.level as AccessLevel;
  const now = Date.now();
  const txs: any[] = [];

  let membershipId: string;
  if (existing.length > 0) {
    membershipId = existing[0].id;
  } else {
    membershipId = id();
    txs.push(
      db.tx.orgMemberships[membershipId]
        .update({ role: "member", createdAt: now })
        .link({ organization: orgId, user: caller.id }),
    );
  }

  // Create access tiers based on level
  txs.push(
    db.tx.workspaceAccess[id()]
      .update({ createdAt: now })
      .link({ orgMembership: membershipId, workspace: wsId }),
  );

  if (level === "comment" || level === "edit") {
    txs.push(
      db.tx.workspaceCommentAccess[id()]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: wsId }),
    );
  }

  if (level === "edit") {
    txs.push(
      db.tx.workspaceEditAccess[id()]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: wsId }),
    );
  }

  // Mark invite as accepted
  txs.push(db.tx.invites[inviteId].update({ status: "accepted" }));

  await db.transact(txs);

  return jsonResponse({ ok: true, orgId, workspaceId: wsId });
};
