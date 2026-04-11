import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { id } from "@instantdb/admin";
import { adminDb, getFixture, cleanupFixture, type TestFixture } from "./setup";

let f: TestFixture;

beforeAll(async () => {
  f = await getFixture();
});

afterAll(async () => {
  await cleanupFixture(f);
});

describe("edit-tier user", () => {
  it("can view candidates", async () => {
    const { result } = await adminDb
      .asUser({ token: f.editToken })
      .debugQuery({ candidates: { $: { where: { "workspace.id": f.wsAId } } } });
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("can create candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([
        adminDb.tx.candidates[id()]
          .update({ name: "New Hire", email: "new@test.com", status: "New", rating: 0, dateAdded: Date.now(), sortOrder: Date.now() })
          .link({ workspace: f.wsAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("can update candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([adminDb.tx.candidates[f.candidateAId].update({ rating: 5 })]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("can delete candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([adminDb.tx.candidates[f.candidateAId].delete()]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("can create positions", async () => {
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([
        adminDb.tx.positions[id()]
          .update({ name: "New Position" })
          .link({ workspace: f.wsAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("can create comments", async () => {
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([
        adminDb.tx.comments[id()]
          .update({ body: "Editor comment", createdAt: Date.now() })
          .link({ candidate: f.candidateAId, workspace: f.wsAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("can delete any comment (editor privilege)", async () => {
    // f.commentId was created by editUser, but any editor can delete any comment
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([adminDb.tx.comments[f.commentId].delete()]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("cannot update other users' comments", async () => {
    // Create a comment as commentUser first via admin (for setup)
    const otherCommentId = id();
    const commentUser = await adminDb.auth.verifyToken(f.commentToken);
    await adminDb.transact([
      adminDb.tx.comments[otherCommentId]
        .update({ body: "Someone else's comment", createdAt: Date.now() })
        .link({ candidate: f.candidateAId, author: commentUser.id, workspace: f.wsAId }),
    ]);

    // editUser can't update (only author can update)
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([adminDb.tx.comments[otherCommentId].update({ body: "Hacked" })]);
    expect(result["all-checks-ok?"]).toBe(false);

    // Cleanup
    await adminDb.transact([adminDb.tx.comments[otherCommentId].delete()]);
  });
});
