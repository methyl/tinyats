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

  const body = (await request.json()) as {
    action: "grant" | "change" | "revoke";
    orgId: string;
    workspaceId: string;
    targetEmail?: string;
    targetMembershipId?: string;
    level?: AccessLevel;
  };

  const { action, orgId, workspaceId, targetEmail, targetMembershipId, level } = body;

  // Verify caller is an org member
  const { orgMemberships: callerMemberships } = await db.query({
    orgMemberships: {
      $: { where: { "organization.id": orgId, "user.id": caller.id } },
    },
  });
  if (callerMemberships.length === 0) {
    return jsonResponse({ error: "Not an org member" }, 403);
  }

  // Verify caller has edit access on the workspace (only editors can manage access)
  const { workspaceEditAccess: callerEditAccess } = await db.query({
    workspaceEditAccess: {
      $: {
        where: {
          "workspace.id": workspaceId,
          "orgMembership.user.id": caller.id,
        },
      },
    },
  });
  if (callerEditAccess.length === 0) {
    return jsonResponse({ error: "Not a workspace editor" }, 403);
  }

  if (action === "grant" && targetEmail && level) {
    return await grantAccess(db, orgId, workspaceId, targetEmail, level);
  }

  if (action === "change" && targetMembershipId && level) {
    return await changeAccess(db, workspaceId, targetMembershipId, level);
  }

  if (action === "revoke" && targetMembershipId) {
    return await revokeAccess(db, workspaceId, targetMembershipId);
  }

  return jsonResponse({ error: "Invalid action" }, 400);
};

async function grantAccess(
  db: ReturnType<typeof init>,
  orgId: string,
  workspaceId: string,
  email: string,
  level: AccessLevel
) {
  // Find or create user
  const { $users } = await db.query({
    $users: { $: { where: { email } } },
  });

  let userId: string;
  if ($users.length > 0) {
    userId = $users[0].id;
  } else {
    // Create the user via auth token (creates user if not exists)
    const token = await db.auth.createToken(email);
    const user = await db.auth.verifyToken(token);
    userId = user.id;
  }

  // Check if already an org member
  const { orgMemberships: existing } = await db.query({
    orgMemberships: {
      $: { where: { "organization.id": orgId, "user.id": userId } },
    },
  });

  let membershipId: string;
  if (existing.length > 0) {
    membershipId = existing[0].id;
  } else {
    // Create org membership
    membershipId = id();
    await db.transact([
      db.tx.orgMemberships[membershipId]
        .update({ role: "member", createdAt: Date.now() })
        .link({ organization: orgId, user: userId }),
    ]);
  }

  // Clear existing access tiers for this workspace
  await clearAccessTiers(db, workspaceId, membershipId);

  // Create new access tiers based on level
  await createAccessTiers(db, workspaceId, membershipId, level);

  return jsonResponse({ ok: true, membershipId });
}

async function changeAccess(
  db: ReturnType<typeof init>,
  workspaceId: string,
  membershipId: string,
  level: AccessLevel
) {
  await clearAccessTiers(db, workspaceId, membershipId);
  await createAccessTiers(db, workspaceId, membershipId, level);
  return jsonResponse({ ok: true });
}

async function revokeAccess(
  db: ReturnType<typeof init>,
  workspaceId: string,
  membershipId: string
) {
  await clearAccessTiers(db, workspaceId, membershipId);
  return jsonResponse({ ok: true });
}

async function clearAccessTiers(
  db: ReturnType<typeof init>,
  workspaceId: string,
  membershipId: string
) {
  const { workspaceAccess, workspaceCommentAccess, workspaceEditAccess } =
    await db.query({
      workspaceAccess: {
        $: { where: { "workspace.id": workspaceId, "orgMembership.id": membershipId } },
      },
      workspaceCommentAccess: {
        $: { where: { "workspace.id": workspaceId, "orgMembership.id": membershipId } },
      },
      workspaceEditAccess: {
        $: { where: { "workspace.id": workspaceId, "orgMembership.id": membershipId } },
      },
    });

  const deletes = [
    ...workspaceAccess.map((a) => db.tx.workspaceAccess[a.id].delete()),
    ...workspaceCommentAccess.map((a) => db.tx.workspaceCommentAccess[a.id].delete()),
    ...workspaceEditAccess.map((a) => db.tx.workspaceEditAccess[a.id].delete()),
  ];

  if (deletes.length > 0) {
    await db.transact(deletes);
  }
}

async function createAccessTiers(
  db: ReturnType<typeof init>,
  workspaceId: string,
  membershipId: string,
  level: AccessLevel
) {
  const now = Date.now();
  const txs: any[] = [];

  // read: workspaceAccess only
  // comment: workspaceAccess + workspaceCommentAccess
  // edit: all three
  txs.push(
    db.tx.workspaceAccess[id()]
      .update({ createdAt: now })
      .link({ orgMembership: membershipId, workspace: workspaceId })
  );

  if (level === "comment" || level === "edit") {
    txs.push(
      db.tx.workspaceCommentAccess[id()]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: workspaceId })
    );
  }

  if (level === "edit") {
    txs.push(
      db.tx.workspaceEditAccess[id()]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: workspaceId })
    );
  }

  await db.transact(txs);
}
