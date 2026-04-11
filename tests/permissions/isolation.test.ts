import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminDb, getFixture, cleanupFixture, type TestFixture } from "./setup";

let f: TestFixture;

beforeAll(async () => {
  f = await getFixture();
});

afterAll(async () => {
  await cleanupFixture(f);
});

describe("workspace isolation", () => {
  it("outsideUser cannot view wsA candidates", async () => {
    const { result } = await adminDb
      .asUser({ token: f.outsideToken })
      .debugQuery({ candidates: { $: { where: { "workspace.id": f.wsAId } } } });
    expect(result.candidates.length).toBe(0);
  });

  it("outsideUser cannot view wsA comments", async () => {
    const { result } = await adminDb
      .asUser({ token: f.outsideToken })
      .debugQuery({ comments: {} });
    expect(result.comments.some((c: any) => c.id === f.commentId)).toBe(false);
  });

  it("outsideUser can view wsB candidates", async () => {
    const { result } = await adminDb
      .asUser({ token: f.outsideToken })
      .debugQuery({ candidates: { $: { where: { "workspace.id": f.wsBId } } } });
    expect(result.candidates.some((c: any) => c.id === f.candidateBId)).toBe(true);
  });

  it("editUser on wsA cannot modify wsB candidates", async () => {
    const result = await adminDb
      .asUser({ token: f.editToken })
      .debugTransact([adminDb.tx.candidates[f.candidateBId].update({ name: "Cross-workspace hack" })]);
    expect(result["all-checks-ok?"]).toBe(false);
  });
});
