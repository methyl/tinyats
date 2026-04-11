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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const db = init({
    appId: env.INSTANT_APP_ID,
    adminToken: env.INSTANT_ADMIN_TOKEN,
    schema,
  });

  // Verify the user's auth token
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  let user;
  try {
    user = await db.auth.verifyToken(token);
  } catch {
    return jsonResponse({ error: "Invalid token" }, 401);
  }

  // Check if user already has memberships
  const { orgMemberships } = await db.query({
    orgMemberships: { $: { where: { "user.id": user.id } } },
  });

  if (orgMemberships.length > 0) {
    return jsonResponse({ error: "Already provisioned" }, 409);
  }

  // Create org + workspace + membership + all three access tiers
  const orgId = id();
  const wsId = id();
  const membershipId = id();
  const accessId = id();
  const commentAccessId = id();
  const editAccessId = id();
  const now = Date.now();

  await db.transact([
    db.tx.organizations[orgId].update({ name: "My Organization", createdAt: now }),
    db.tx.workspaces[wsId]
      .update({ name: "Default", createdAt: now })
      .link({ organization: orgId }),
    db.tx.orgMemberships[membershipId]
      .update({ role: "owner", createdAt: now })
      .link({ organization: orgId, user: user.id }),
    db.tx.workspaceAccess[accessId]
      .update({ createdAt: now })
      .link({ orgMembership: membershipId, workspace: wsId }),
    db.tx.workspaceCommentAccess[commentAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: membershipId, workspace: wsId }),
    db.tx.workspaceEditAccess[editAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: membershipId, workspace: wsId }),
  ]);

  return jsonResponse({ orgId, workspaceId: wsId });
};
