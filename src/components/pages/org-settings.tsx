import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { useWorkspace } from "@/lib/workspace-context";

type AccessLevel = "read" | "comment" | "edit";

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 3.5h9M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M10 3.5l-.4 7a1 1 0 01-1 .9H5.4a1 1 0 01-1-.9L4 3.5" />
    </svg>
  );
}

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

function CopyButton({ inviteId }: { inviteId: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/invite/${inviteId}`;

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="text-[12px] text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function ResendButton({ inviteId, userToken }: { inviteId: string; userToken?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  return (
    <button
      disabled={state !== "idle" || !userToken}
      onClick={() => {
        setState("sending");
        fetch("/api/send-invite", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inviteId }),
        })
          .then(() => {
            setState("sent");
            setTimeout(() => setState("idle"), 2000);
          })
          .catch(() => setState("idle"));
      }}
      className="text-[12px] text-gray-500 hover:text-gray-700 disabled:text-gray-300 cursor-pointer whitespace-nowrap"
    >
      {state === "sending" ? "..." : state === "sent" ? "Sent!" : "Resend"}
    </button>
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

  const { data: inviteData } = db.useQuery(
    currentWorkspace
      ? {
          invites: {
            $: { where: { "workspace.id": currentWorkspace.id } },
            inviter: {},
          },
        }
      : { invites: { $: { where: { id: "__none__" } } } }
  );

  const members = (orgData as any)?.orgMemberships ?? [];
  const allInvites = ((inviteData as any)?.invites ?? [])
    .filter((inv: any) => inv.status !== "accepted")
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  // Only show invites to admins or the person who sent them
  const canManage = isOrgAdmin || hasEditAccess;
  const invites = allInvites.filter(
    (inv: any) => canManage || inv.inviter?.id === user?.id
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentOrg || !currentWorkspace) return;
    setInviting(true);
    setError("");

    try {
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
          }),
      );

      const token = (user as any).refresh_token;
      if (token) {
        fetch("/api/send-invite", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inviteId }),
        }).catch(() => {});
      }

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
      const creates = buildAccessTiers(newLevel, membership.id, currentWorkspace.id);
      await db.transact([...deletes, ...creates]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Remove member entirely — deletes membership and all access tiers
  const handleRemoveMember = async (membership: any) => {
    if (!currentWorkspace) return;
    setError("");
    try {
      const deletes = [
        // Delete all access tiers for this workspace
        ...(membership.accessGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceAccess[g.id].delete()),
        ...(membership.commentGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceCommentAccess[g.id].delete()),
        ...(membership.editGrants ?? [])
          .filter((g: any) => g.workspace?.id === currentWorkspace.id)
          .map((g: any) => db.tx.workspaceEditAccess[g.id].delete()),
        // Delete the membership itself
        db.tx.orgMemberships[membership.id].delete(),
      ];
      await db.transact(deletes);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await db.transact(db.tx.invites[inviteId].delete());
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

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">
              Pending invites ({invites.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {invites.map((invite: any) => (
              <div key={invite.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invite.email}</p>
                  <p className="text-[12px] text-gray-400">
                    {invite.level} access
                    {invite.inviter?.email ? ` \u00b7 by ${invite.inviter.email.split("@")[0]}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton inviteId={invite.id} />
                  <ResendButton inviteId={invite.id} userToken={(user as any)?.refresh_token} />
                  <button
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                    {memberUser?.email ?? memberUser?.id?.slice(0, 8) ?? "..."}
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
                      onClick={() => handleRemoveMember(membership)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <TrashIcon />
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
