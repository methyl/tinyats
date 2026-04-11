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

export function OrgSettings() {
  const {
    currentOrg,
    currentWorkspace,
    orgMemberships,
    isOrgAdmin,
  } = useWorkspace();
  const { user } = db.useAuth();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLevel, setInviteLevel] = useState<AccessLevel>("edit");
  const [inviting, setInviting] = useState(false);

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

  const members = orgData?.orgMemberships ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentOrg || !currentWorkspace) return;
    setInviting(true);

    try {
      // Create invite record
      const inviteId = id();
      await db.transact(
        db.tx.invites[inviteId]
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
          })
      );

      setInviteEmail("");
    } finally {
      setInviting(false);
    }
  };

  function getMemberLevel(membership: any): AccessLevel {
    const wsId = currentWorkspace?.id;
    if (!wsId) return "read";
    const hasEdit = (membership.editGrants ?? []).some((g: any) => g.workspace?.id === wsId);
    if (hasEdit) return "edit";
    const hasComment = (membership.commentGrants ?? []).some((g: any) => g.workspace?.id === wsId);
    if (hasComment) return "comment";
    return "read";
  }

  if (!currentOrg) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{currentOrg.name}</h2>
      <p className="text-sm text-gray-500 mb-6">
        Manage members and permissions for {currentWorkspace?.name ?? "this workspace"}
      </p>

      {/* Invite form */}
      {isOrgAdmin && (
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
            return (
              <div key={membership.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {memberUser?.email ?? "Unknown"}
                  </p>
                  <p className="text-[12px] text-gray-400">{membership.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <LevelBadge level={level} />
                  {isOrgAdmin && memberUser?.id !== user?.id && (
                    <button
                      onClick={() => {
                        db.transact(db.tx.orgMemberships[membership.id].delete());
                      }}
                      className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      Remove
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
