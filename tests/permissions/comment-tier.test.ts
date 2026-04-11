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

describe("comment-tier user", () => {
  it("can view candidates", async () => {
    const { result } = await adminDb
      .asUser({ token: f.commentToken })
      .debugQuery({ candidates: { $: { where: { "workspace.id": f.wsAId } } } });
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("cannot create candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.commentToken })
      .debugTransact([
        adminDb.tx.candidates[id()]
          .update({ name: "Unauthorized", email: "x@test.com", status: "New", rating: 0, dateAdded: Date.now(), sortOrder: Date.now() })
          .link({ workspace: f.wsAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("cannot update candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.commentToken })
      .debugTransact([adminDb.tx.candidates[f.candidateAId].update({ name: "Hacked" })]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("cannot delete candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.commentToken })
      .debugTransact([adminDb.tx.candidates[f.candidateAId].delete()]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("can create comments on candidates in their workspace", async () => {
    const result = await adminDb
      .asUser({ token: f.commentToken })
      .debugTransact([
        adminDb.tx.comments[id()]
          .update({ body: "Nice candidate!", createdAt: Date.now() })
          .link({ candidate: f.candidateAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("cannot update other users' comments", async () => {
    // f.commentId was created by editUser
    const result = await adminDb
      .asUser({ token: f.commentToken })
      .debugTransact([adminDb.tx.comments[f.commentId].update({ body: "Hacked" })]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("cannot delete other users' comments (not an editor)", async () => {
    // f.commentId was created by editUser; commentUser is not an editor
    const result = await adminDb
      .asUser({ token: f.commentToken })
      .debugTransact([adminDb.tx.comments[f.commentId].delete()]);
    expect(result["all-checks-ok?"]).toBe(false);
  });
});
