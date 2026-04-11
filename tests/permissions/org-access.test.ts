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

describe("org-level permissions", () => {
  it("members can view their own org", async () => {
    const { result } = await adminDb
      .asUser({ token: f.readToken })
      .debugQuery({ organizations: { $: { where: { id: f.orgId } } } });
    expect(result.organizations.length).toBe(1);
    expect(result.organizations[0].id).toBe(f.orgId);
  });

  it("any authenticated user can create an org", async () => {
    const result = await adminDb
      .asUser({ token: f.readToken })
      .debugTransact([
        adminDb.tx.organizations[id()].update({ name: "New Org", createdAt: Date.now() }),
      ]);
    expect(result["all-checks-ok?"]).toBe(true);
  });

  it("members can view org memberships within their org", async () => {
    const { result } = await adminDb
      .asUser({ token: f.readToken })
      .debugQuery({ orgMemberships: { $: { where: { "organization.id": f.orgId } } } });
    expect(result.orgMemberships.length).toBeGreaterThan(0);
  });
});
