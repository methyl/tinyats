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
  describe("editors can grant read and comment access", () => {
    it("edit user can create workspaceAccess for another member", async () => {
      const result = await adminDb
        .asUser({ token: f.editToken })
        .debugTransact([
          adminDb.tx.workspaceAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.outsideMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(true);
    });

    it("edit user can create workspaceCommentAccess for another member", async () => {
      const result = await adminDb
        .asUser({ token: f.editToken })
        .debugTransact([
          adminDb.tx.workspaceCommentAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.readMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(true);
    });
  });

  describe("non-editors cannot grant access", () => {
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

    it("comment user cannot create workspaceAccess", async () => {
      const result = await adminDb
        .asUser({ token: f.commentToken })
        .debugTransact([
          adminDb.tx.workspaceAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.commentMembershipId, workspace: f.wsAId }),
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

  describe("org admins can grant edit access (no self-reference via orgAdminAccess)", () => {
    it("org admin (editUser with owner role) can create workspaceEditAccess", async () => {
      // editUser has role "owner" and thus has orgAdminAccess
      const result = await adminDb
        .asUser({ token: f.editToken })
        .debugTransact([
          adminDb.tx.workspaceEditAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.readMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(true);
    });

    it("org admin can delete workspaceEditAccess", async () => {
      const { result } = await adminDb
        .asUser({ token: f.editToken })
        .debugQuery({
          workspaceEditAccess: { $: { where: { "workspace.id": f.wsAId } } },
        });
      if (result.workspaceEditAccess.length > 0) {
        const deleteResult = await adminDb
          .asUser({ token: f.editToken })
          .debugTransact([
            adminDb.tx.workspaceEditAccess[result.workspaceEditAccess[0].id].delete(),
          ]);
        expect(deleteResult["all-checks-ok?"]).toBe(true);
      }
    });

    it("non-admin cannot create workspaceEditAccess", async () => {
      const result = await adminDb
        .asUser({ token: f.readToken })
        .debugTransact([
          adminDb.tx.workspaceEditAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.readMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
    });

    it("non-admin editor cannot create workspaceEditAccess", async () => {
      // commentUser is role "member", not admin — even though they have comment access
      const result = await adminDb
        .asUser({ token: f.commentToken })
        .debugTransact([
          adminDb.tx.workspaceEditAccess[id()]
            .update({ createdAt: Date.now() })
            .link({ orgMembership: f.commentMembershipId, workspace: f.wsAId }),
        ]);
      expect(result["all-checks-ok?"]).toBe(false);
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
