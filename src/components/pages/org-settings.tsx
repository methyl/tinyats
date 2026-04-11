import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { useWorkspace } from "@/lib/workspace-context";

type AccessLevel = "read" | "comment" | "edit";

function LevelBadge({ level }: { level: AccessLevel }) {
  const colors = {
    read: "bg-gray-100 text-gray-600",
    comment: "bg-blue-50 text-blue-600",
    edit: "bg-green-50 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[12px] font-medium ${colors[level]}`}>
      {level}
    </span>
  );
}

function buildAccessTiers(
  level: AccessLevel,
  membershipId: string,
  workspaceId: string,
) {
  const now = Date.now();
  const txs: any[] = [
    db.tx.workspaceAccess[id()]
      .update({ createdAt: now })
      .link({ orgMembership: membershipId, workspace: workspaceId }),
  ];
  if (level === "comment" || level === "edit") {
    txs.push(
      db.tx.workspaceCommentAccess[id()]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: workspaceId }),
    );
  }
  if (level === "edit") {
    txs.push(
      db.tx.workspaceEditAccess[id()]
        .update({ createdAt: now })
        .link({ orgMembership: membershipId, workspace: workspaceId }),
    );
  }
  return txs;
}

export function OrgSettings() {
  const {
    currentOrg,
    currentWorkspace,
    isOrgAdmin,
    hasEditAccess,
  } = useWorkspace();
  const { user } = db.useAuth();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLevel, setInviteLevel] = useState<AccessLevel>("edit");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  // Get all memberships for current org
  const { data: orgData } = db.useQuery(
    currentOrg
      ? {
          orgMemberships: {
            $: { where: { "organization.id": currentOrg.id } },
            user: {},
            accessGrants: { workspace: {} },
            commentGrants: { workspace: {} },
            editGrants: { workspace: {} },
          },
        }
      : { orgMemberships: { $: { where: { id: "__none__" } } } }
  );

  const members = (orgData as any)?.orgMemberships ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentOrg || !currentWorkspace) return;
    setInviting(true);
    setError("");

    try {
      // Create membership + access tiers in one transaction
      const membershipId = id();
      const txs: any[] = [
        db.tx.orgMemberships[membershipId]
          .update({ role: "member", createdAt: Date.now() })
          .link({ organization: currentOrg.id }),
        ...buildAccessTiers(inviteLevel, membershipId, currentWorkspace.id),
      ];
      // Create invite record for tracking
      txs.push(
        db.tx.invites[id()]
          .update({
            email: inviteEmail.trim().toLowerCase(),
            level: inviteLevel,
            status: "pending",
            createdAt: Date.now(),
          })
          .link({
            organization: currentOrg.id,
            workspace: currentWorkspace.id,
            inviter: user!.id,
          }),
      );
      await db.transact(txs);
      setInviteEmail("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleChangeLevel = async (membership: any, newLevel: AccessLevel) => {
    if (!currentWorkspace) return;
    setError("");
    try {
      // Delete existing access tiers for this workspace
      const deletes = [
        ...(membership.accessGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceAccess[g.id].delete()),
        ...(membership.commentGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceCommentAccess[g.id].delete()),
        ...(membership.editGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceEditAccess[g.id].delete()),
      ];
      // Create new tiers
      const creates = buildAccessTiers(newLevel, membership.id, currentWorkspace.id);
      await db.transact([...deletes, ...creates]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevoke = async (membership: any) => {
    if (!currentWorkspace) return;
    setError("");
    try {
      const deletes = [
        ...(membership.accessGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceAccess[g.id].delete()),
        ...(membership.commentGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceCommentAccess[g.id].delete()),
        ...(membership.editGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceEditAccess[g.id].delete()),
      ];
      if (deletes.length > 0) {
        await db.transact(deletes);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  function getMemberLevel(membership: any): AccessLevel | null {
    const wsId = currentWorkspace?.id;
    if (!wsId) return null;
    if ((membership.editGrants ?? []).some((g: any) => g.workspace?.id === wsId)) return "edit";
    if ((membership.commentGrants ?? []).some((g: any) => g.workspace?.id === wsId)) return "comment";
    if ((membership.accessGrants ?? []).some((g: any) => g.workspace?.id === wsId)) return "read";
    return null;
  }

  if (!currentOrg) return null;

  const canManage = isOrgAdmin || hasEditAccess;

  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{currentOrg.name}</h2>
      <p className="text-sm text-gray-500 mb-6">
        Manage members and permissions for {currentWorkspace?.name ?? "this workspace"}
      </p>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Invite form */}
      {canManage && (
        <form onSubmit={handleInvite} className="mb-8 p-4 rounded-xl border border-gray-200 bg-white">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Invite member</h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@company.com"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
            <select
              value={inviteLevel}
              onChange={(e) => setInviteLevel(e.target.value as AccessLevel)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="read">Read</option>
              <option value="comment">Comment</option>
              <option value="edit">Edit</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {inviting ? "..." : "Invite"}
            </button>
          </div>
        </form>
      )}

      {/* Members list */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900">
            Members ({members.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((membership: any) => {
            const memberUser = membership.user;
            const level = getMemberLevel(membership);
            const isSelf = memberUser?.id === user?.id;
            return (
              <div key={membership.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {memberUser?.email ?? "Unknown"}
                    {isSelf && <span className="text-gray-400 ml-1">(you)</span>}
                  </p>
                  <p className="text-[12px] text-gray-400">{membership.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && !isSelf && level ? (
                    <select
                      value={level}
                      onChange={(e) => handleChangeLevel(membership, e.target.value as AccessLevel)}
                      className="px-2 py-0.5 rounded border border-gray-200 text-[12px] bg-white cursor-pointer"
                    >
                      <option value="read">Read</option>
                      <option value="comment">Comment</option>
                      <option value="edit">Edit</option>
                    </select>
                  ) : level ? (
                    <LevelBadge level={level} />
                  ) : (
                    <span className="text-[12px] text-gray-400">No workspace access</span>
                  )}
                  {canManage && !isSelf && (
                    <button
                      onClick={() => handleRevoke(membership)}
                      className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No members yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
