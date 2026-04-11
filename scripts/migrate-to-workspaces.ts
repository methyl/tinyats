import { init, id } from "@instantdb/admin";
import schema from "../src/instant.schema";

const adminDb = init({
  appId: process.env.VITE_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
  schema,
});

async function migrate() {
  console.log("Starting workspace migration...");

  // 1. Create default org and workspace
  const orgId = id();
  const wsId = id();
  const now = Date.now();

  await adminDb.transact([
    adminDb.tx.organizations[orgId].update({ name: "TinyATS", createdAt: now }),
    adminDb.tx.workspaces[wsId]
      .update({ name: "Default", createdAt: now })
      .link({ organization: orgId }),
  ]);
  console.log(`Created org "${orgId}" and workspace "${wsId}"`);

  // 2. For all existing users: create orgMembership (owner) + all three access tiers
  const { $users } = await adminDb.query({ $users: {} });
  console.log(`Found ${$users.length} users`);

  for (const user of $users) {
    const membershipId = id();
    const accessId = id();
    const commentAccessId = id();
    const editAccessId = id();

    await adminDb.transact([
      adminDb.tx.orgMemberships[membershipId]
        .update({ role: "owner", createdAt: now })
        .link({ organization: orgId, user: user.id }),
      adminDb.tx.workspaceAccess[accessId]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: wsId }),
      adminDb.tx.workspaceCommentAccess[commentAccessId]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: wsId }),
      adminDb.tx.workspaceEditAccess[editAccessId]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: wsId }),
    ]);
    console.log(`  Provisioned user ${user.email || user.id}`);
  }

  // 3. Link all existing candidates to the default workspace
  const { candidates } = await adminDb.query({ candidates: {} });
  if (candidates.length > 0) {
    const candidateTxs = candidates.map((c) =>
      adminDb.tx.candidates[c.id].link({ workspace: wsId })
    );
    await adminDb.transact(candidateTxs);
    console.log(`Linked ${candidates.length} candidates to default workspace`);
  }

  // 4. Link all existing positions to the default workspace
  const { positions } = await adminDb.query({ positions: {} });
  if (positions.length > 0) {
    const positionTxs = positions.map((p) =>
      adminDb.tx.positions[p.id].link({ workspace: wsId })
    );
    await adminDb.transact(positionTxs);
    console.log(`Linked ${positions.length} positions to default workspace`);
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);
