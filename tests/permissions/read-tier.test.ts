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

describe("read-tier user", () => {
  it("can view candidates in their workspace", async () => {
    const { result } = await adminDb
      .asUser({ token: f.readToken })
      .debugQuery({ candidates: { $: { where: { "workspace.id": f.wsAId } } } });
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.some((c: any) => c.id === f.candidateAId)).toBe(true);
  });

  it("cannot view candidates in other workspaces", async () => {
    const { result } = await adminDb
      .asUser({ token: f.readToken })
      .debugQuery({ candidates: { $: { where: { "workspace.id": f.wsBId } } } });
    expect(result.candidates.length).toBe(0);
  });

  it("cannot create candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.readToken })
      .debugTransact([
        adminDb.tx.candidates[id()]
          .update({ name: "Unauthorized", email: "x@test.com", status: "New", rating: 0, dateAdded: Date.now(), sortOrder: Date.now() })
          .link({ workspace: f.wsAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("cannot update candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.readToken })
      .debugTransact([adminDb.tx.candidates[f.candidateAId].update({ name: "Hacked" })]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("cannot delete candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.readToken })
      .debugTransact([adminDb.tx.candidates[f.candidateAId].delete()]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("can view comments", async () => {
    const { result } = await adminDb
      .asUser({ token: f.readToken })
      .debugQuery({ comments: {} });
    expect(result.comments.length).toBeGreaterThan(0);
  });

  it("cannot create comments", async () => {
    const result = await adminDb
      .asUser({ token: f.readToken })
      .debugTransact([
        adminDb.tx.comments[id()]
          .update({ body: "Unauthorized comment", createdAt: Date.now() })
          .link({ candidate: f.candidateAId, workspace: f.wsAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(false);
  });

  it("can view positions in their workspace", async () => {
    const { result } = await adminDb
      .asUser({ token: f.readToken })
      .debugQuery({ positions: { $: { where: { "workspace.id": f.wsAId } } } });
    expect(result.positions.length).toBeGreaterThan(0);
  });

  it("cannot create positions", async () => {
    const result = await adminDb
      .asUser({ token: f.readToken })
      .debugTransact([
        adminDb.tx.positions[id()]
          .update({ name: "Unauthorized Position" })
          .link({ workspace: f.wsAId }),
      ]);
    expect(result["all-checks-ok?"]).toBe(false);
  });
});
