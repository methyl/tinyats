import type { InstantRules } from "@instantdb/react";

const rules = {
  organizations: {
    allow: {
      view: "auth.id in data.ref('orgMemberships.user.id')",
      create: "auth.id != null",
      update: "auth.id in data.ref('orgMemberships.user.id')",
      delete: "false",
    },
  },
  workspaces: {
    allow: {
      view: "auth.id in data.ref('access.orgMembership.user.id')",
      create: "auth.id in data.ref('organization.orgMemberships.user.id')",
      update: "auth.id in data.ref('editors.orgMembership.user.id')",
      delete: "false",
    },
  },
  orgMemberships: {
    allow: {
      view: "auth.id in data.ref('organization.orgMemberships.user.id')",
      create: "auth.id in data.ref('organization.orgMemberships.user.id')",
      update: "auth.id in data.ref('organization.orgMemberships.user.id')",
      delete: "auth.id in data.ref('organization.orgMemberships.user.id')",
    },
  },
  workspaceAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      // Workspace editors can grant read access
      create: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      update: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      delete: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  workspaceCommentAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      // Workspace editors can grant comment access
      create: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      update: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      delete: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  workspaceEditAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      // MUST be false — data.ref self-references during creation, allowing
      // any user to escalate. Only admin SDK can create/modify edit access.
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
