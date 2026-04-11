import type { InstantRules } from "@instantdb/react";

const rules = {
  organizations: {
    allow: {
      view: "auth.id in data.ref('orgMemberships.user.id')",
      // Any authenticated user can create an org (for provisioning).
      // The org is empty until a membership is added atomically.
      create: "auth.id != null",
      update: "auth.id in data.ref('orgMemberships.user.id')",
      delete: "false",
    },
  },
  workspaces: {
    allow: {
      view: "auth.id in data.ref('access.orgMembership.user.id')",
      // Any authenticated user can create a workspace (for provisioning).
      // Workspace is useless without access tiers which are admin-only.
      create: "auth.id != null",
      update: "auth.id in data.ref('editors.orgMembership.user.id')",
      delete: "false",
    },
  },
  orgMemberships: {
    allow: {
      view: "auth.id in data.ref('organization.orgMemberships.user.id')",
      // Only existing org members can create new memberships.
      // During provisioning, the user creates the org + membership atomically —
      // InstantDB evaluates the batch as a whole, so the self-referencing check passes.
      create: "auth.id in data.ref('organization.orgMemberships.user.id')",
      update: "auth.id in data.ref('organization.orgMemberships.user.id')",
      delete: "auth.id in data.ref('organization.orgMemberships.user.id')",
    },
  },
  // Access tier entities can ONLY be created via the admin SDK (server-side).
  // This prevents privilege escalation — users cannot grant themselves access.
  // The provisioning flow uses a server endpoint to create these atomically.
  workspaceAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  workspaceCommentAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  workspaceEditAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  candidates: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      update: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      delete: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  positions: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      update: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      delete: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  comments: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "auth.id in data.ref('workspace.commenters.orgMembership.user.id')",
      update: "auth.id in data.ref('author.id')",
      delete: "auth.id in data.ref('author.id') || auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  invites: {
    allow: {
      view: "auth.id in data.ref('organization.orgMemberships.user.id')",
      create: "auth.id in data.ref('organization.orgMemberships.user.id')",
      update: "auth.id in data.ref('organization.orgMemberships.user.id')",
      delete: "auth.id in data.ref('organization.orgMemberships.user.id')",
    },
  },
} satisfies InstantRules;

export default rules;
