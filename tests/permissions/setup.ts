import { init, id } from "@instantdb/admin";
import schema from "../../src/instant.schema";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load env vars
dotenv.config({ path: resolve(__dirname, "../../.env") });

const appId = process.env.VITE_INSTANT_APP_ID!;
const adminToken = process.env.INSTANT_ADMIN_TOKEN!;

export const adminDb = init({ appId, adminToken, schema });

export type TestFixture = {
  orgId: string;
  wsAId: string;
  wsBId: string;
  readMembershipId: string;
  commentMembershipId: string;
  editMembershipId: string;
  outsideMembershipId: string;
  candidateAId: string;
  candidateBId: string;
  positionAId: string;
  commentId: string;
  readToken: string;
  commentToken: string;
  editToken: string;
  outsideToken: string;
};

let fixture: TestFixture | null = null;
let fixturePromise: Promise<TestFixture> | null = null;

export async function getFixture(): Promise<TestFixture> {
  if (fixture) return fixture;
  if (fixturePromise) return fixturePromise;
  fixturePromise = createTestFixture();
  fixture = await fixturePromise;
  return fixture;
}

async function getOrCreateToken(email: string): Promise<string> {
  try {
    return await adminDb.auth.createToken(email);
  } catch {
    // User already exists — sign them in by generating a magic code
    const { code } = await adminDb.auth.generateMagicCode({ email });
    const { user } = await adminDb.auth.checkMagicCode(email, code);
    // Generate a fresh token for an existing user
    return await adminDb.auth.createToken(email);
  }
}

async function createTestFixture(): Promise<TestFixture> {
  const testRunId = Date.now().toString(36);
  const readEmail = `perm-read-${testRunId}@test.com`;
  const commentEmail = `perm-comment-${testRunId}@test.com`;
  const editEmail = `perm-edit-${testRunId}@test.com`;
  const outsideEmail = `perm-outside-${testRunId}@test.com`;

  // createToken returns a string (refresh_token) directly
  const readToken = await adminDb.auth.createToken(readEmail);
  const commentToken = await adminDb.auth.createToken(commentEmail);
  const editToken = await adminDb.auth.createToken(editEmail);
  const outsideToken = await adminDb.auth.createToken(outsideEmail);

  // Get user IDs by verifying tokens
  const readUser = await adminDb.auth.verifyToken(readToken);
  const commentUser = await adminDb.auth.verifyToken(commentToken);
  const editUser = await adminDb.auth.verifyToken(editToken);
  const outsideUser = await adminDb.auth.verifyToken(outsideToken);

  const orgId = id();
  const wsAId = id();
  const wsBId = id();

  const readMembershipId = id();
  const commentMembershipId = id();
  const editMembershipId = id();
  const outsideMembershipId = id();

  const editAdminAccessId = id();
  const readAccessId = id();
  const commentAccessId = id();
  const commentCommentAccessId = id();
  const editAccessId = id();
  const editCommentAccessId = id();
  const editEditAccessId = id();
  const outsideAccessId = id();

  const candidateAId = id();
  const candidateBId = id();
  const positionAId = id();
  const commentId = id();

  const now = Date.now();

  await adminDb.transact([
    // Org
    adminDb.tx.organizations[orgId].update({ name: "Test Org", createdAt: now }),

    // Workspaces
    adminDb.tx.workspaces[wsAId]
      .update({ name: "Workspace A", createdAt: now })
      .link({ organization: orgId }),
    adminDb.tx.workspaces[wsBId]
      .update({ name: "Workspace B", createdAt: now })
      .link({ organization: orgId }),

    // Memberships
    adminDb.tx.orgMemberships[readMembershipId]
      .update({ role: "member", createdAt: now })
      .link({ organization: orgId, user: readUser.id }),
    adminDb.tx.orgMemberships[commentMembershipId]
      .update({ role: "member", createdAt: now })
      .link({ organization: orgId, user: commentUser.id }),
    adminDb.tx.orgMemberships[editMembershipId]
      .update({ role: "owner", createdAt: now })
      .link({ organization: orgId, user: editUser.id }),
    adminDb.tx.orgMemberships[outsideMembershipId]
      .update({ role: "member", createdAt: now })
      .link({ organization: orgId, user: outsideUser.id }),

    // Org admin access for editUser (owner role)
    adminDb.tx.orgAdminAccess[editAdminAccessId]
      .update({ createdAt: now })
      .link({ organization: orgId, user: editUser.id }),

    // Read user: workspaceAccess on wsA only
    adminDb.tx.workspaceAccess[readAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: readMembershipId, workspace: wsAId }),

    // Comment user: workspaceAccess + workspaceCommentAccess on wsA
    adminDb.tx.workspaceAccess[commentAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: commentMembershipId, workspace: wsAId }),
    adminDb.tx.workspaceCommentAccess[commentCommentAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: commentMembershipId, workspace: wsAId }),

    // Edit user: all three tiers on wsA
    adminDb.tx.workspaceAccess[editAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: editMembershipId, workspace: wsAId }),
    adminDb.tx.workspaceCommentAccess[editCommentAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: editMembershipId, workspace: wsAId }),
    adminDb.tx.workspaceEditAccess[editEditAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: editMembershipId, workspace: wsAId }),

    // Outside user: workspaceAccess on wsB only
    adminDb.tx.workspaceAccess[outsideAccessId]
      .update({ createdAt: now })
      .link({ orgMembership: outsideMembershipId, workspace: wsBId }),

    // Position in wsA
    adminDb.tx.positions[positionAId]
      .update({ name: "Test Position" })
      .link({ workspace: wsAId }),

    // Candidate in wsA
    adminDb.tx.candidates[candidateAId]
      .update({
        name: "Test Candidate A",
        email: "a@test.com",
        status: "New",
        rating: 3,
        dateAdded: now,
        sortOrder: now,
      })
      .link({ workspace: wsAId, position: positionAId }),

    // Candidate in wsB
    adminDb.tx.candidates[candidateBId]
      .update({
        name: "Test Candidate B",
        email: "b@test.com",
        status: "New",
        rating: 2,
        dateAdded: now,
        sortOrder: now,
      })
      .link({ workspace: wsBId }),

    // Comment on wsA candidate by editUser
    adminDb.tx.comments[commentId]
      .update({ body: "Great candidate!", createdAt: now })
      .link({ candidate: candidateAId, author: editUser.id, workspace: wsAId }),
  ]);

  return {
    orgId,
    wsAId,
    wsBId,
    readMembershipId,
    commentMembershipId,
    editMembershipId,
    outsideMembershipId,
    candidateAId,
    candidateBId,
    positionAId,
    commentId,
    readToken,
    commentToken,
    editToken,
    outsideToken,
  };
}

// Only call cleanup once, after all tests are done
let cleanedUp = false;
export async function cleanupFixture(f: TestFixture) {
  if (cleanedUp || !f) return;
  cleanedUp = true;
  try {
    await adminDb.transact([
      adminDb.tx.comments[f.commentId].delete(),
      adminDb.tx.candidates[f.candidateAId].delete(),
      adminDb.tx.candidates[f.candidateBId].delete(),
      adminDb.tx.positions[f.positionAId].delete(),
      adminDb.tx.workspaces[f.wsAId].delete(),
      adminDb.tx.workspaces[f.wsBId].delete(),
      adminDb.tx.organizations[f.orgId].delete(),
    ]);
  } catch {
    // Cleanup is best-effort
  }
  fixture = null;
}
