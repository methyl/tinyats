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

describe("privilege escalation prevention", () => {
  describe("access tier creation is blocked client-side", () => {
    it("read user cannot create workspaceAccess", async () => {
      const result = await adminDb
        .asUser({ token: f.readToken })
        .debugTransact([
          adminDb.tx.workspaceAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.readMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });

    it("read user cannot create workspaceCommentAccess", async () => {
      const result = await adminDb
        .asUser({ token: f.readToken })
        .debugTransact([
          adminDb.tx.workspaceCommentAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.readMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });

    it("read user cannot create workspaceEditAccess", async () => {
      const result = await adminDb
        .asUser({ token: f.readToken })
        .debugTransact([
          adminDb.tx.workspaceEditAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.readMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });

    it("comment user cannot create workspaceEditAccess", async () => {
      const result = await adminDb
        .asUser({ token: f.commentToken })
        .debugTransact([
          adminDb.tx.workspaceEditAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.commentMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });

    it("edit user cannot create workspaceEditAccess", async () => {
      const result = await adminDb
        .asUser({ token: f.editToken })
        .debugTransact([
          adminDb.tx.workspaceEditAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.editMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });

    it("outsideUser cannot create workspaceAccess for wsA", async () => {
      const result = await adminDb
        .asUser({ token: f.outsideToken })
        .debugTransact([
          adminDb.tx.workspaceAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.outsideMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });
  });

  describe("access tier mutation is blocked client-side", () => {
    it("edit user cannot delete workspaceAccess", async () => {
      // Even editors can't remove access tiers — only admin SDK
      const { result } = await adminDb
        .asUser({ token: f.editToken })
        .debugQuery({
          workspaceAccess: { $: { where: { "workspace.id": f.wsAId } } },
        });
      if (result.workspaceAccess.length > 0) {
        const accessId = result.workspaceAccess[0].id;
        const deleteResult = await adminDb
          .asUser({ token: f.editToken })
          .debugTransact([adminDb.tx.workspaceAccess[accessId].delete()]);
        expect(deleteResult["all-checks-ok?"]).toBe(false);
      }
    });
  });

  describe("orgMembership creation is restricted", () => {
    it("random user cannot create orgMembership in a foreign org", async () => {
      const randomToken = await adminDb.auth.createToken(
        `random-${Date.now().toString(36)}@test.com`
      );
      const randomUser = await adminDb.auth.verifyToken(randomToken);

      const result = await adminDb
        .asUser({ token: randomToken })
        .debugTransact([
          adminDb.tx.orgMemberships[id()]
            .update({ role: "member", createdAt: Date.now() })
            .link({ organization: f.orgId, user: randomUser.id }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });

    it("self-provisioning (org + membership atomic) still works", async () => {
      const provToken = await adminDb.auth.createToken(
        `provision-${Date.now().toString(36)}@test.com`
      );
      const provUser = await adminDb.auth.verifyToken(provToken);

      const newOrgId = id();
      const result = await adminDb
        .asUser({ token: provToken })
        .debugTransact([
          adminDb.tx.organizations[newOrgId].update({ name: "New Org", createdAt: Date.now() }),
          adminDb.tx.orgMemberships[id()]
            .update({ role: "owner", createdAt: Date.now() })
            .link({ organization: newOrgId, user: provUser.id }),
        ]);
      expect(result["all-checks-ok?"]).toBe(true);
    });
  });
});
