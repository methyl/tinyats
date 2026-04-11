import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    organizations: i.entity({
      name: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    workspaces: i.entity({
      name: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    orgMemberships: i.entity({
      role: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    workspaceAccess: i.entity({
      createdAt: i.number().indexed(),
    }),
    workspaceCommentAccess: i.entity({
      createdAt: i.number().indexed(),
    }),
    workspaceEditAccess: i.entity({
      createdAt: i.number().indexed(),
    }),
    candidates: i.entity({
      name: i.string().indexed(),
      status: i.string().indexed(),
      rating: i.number().indexed(),
      linkedin: i.string().optional(),
      github: i.string().optional(),
      resume: i.string().optional(),
      phone: i.string().optional(),
      email: i.string(),
      note: i.string().optional(),
      dateAdded: i.number().indexed(),
      hasCalendarEvent: i.boolean().optional(),
      activityLevel: i.string().optional(),
      sortOrder: i.number().indexed(),
    }),
    positions: i.entity({
      name: i.string().indexed(),
    }),
    comments: i.entity({
      body: i.string(),
      createdAt: i.number().indexed(),
    }),
    invites: i.entity({
      email: i.string().indexed(),
      level: i.string().indexed(),
      status: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    candidatePosition: {
      forward: {
        on: "candidates",
        has: "one",
        label: "position",
      },
      reverse: {
        on: "positions",
        has: "many",
        label: "candidates",
      },
    },
    // Org → Workspace
    orgWorkspace: {
      forward: {
        on: "workspaces",
        has: "one",
        label: "organization",
      },
      reverse: {
        on: "organizations",
        has: "many",
        label: "workspaces",
      },
    },
    // Org → OrgMembership
    orgOrgMembership: {
      forward: {
        on: "orgMemberships",
        has: "one",
        label: "organization",
      },
      reverse: {
        on: "organizations",
        has: "many",
        label: "orgMemberships",
      },
    },
    // OrgMembership → User
    orgMembershipUser: {
      forward: {
        on: "orgMemberships",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "orgMemberships",
      },
    },
    // --- Three access tier links (each tier → orgMembership + workspace) ---
    accessOrgMembership: {
      forward: {
        on: "workspaceAccess",
        has: "one",
        label: "orgMembership",
      },
      reverse: {
        on: "orgMemberships",
        has: "many",
        label: "accessGrants",
      },
    },
    accessWorkspace: {
      forward: {
        on: "workspaceAccess",
        has: "one",
        label: "workspace",
      },
      reverse: {
        on: "workspaces",
        has: "many",
        label: "access",
      },
    },
    commentAccessOrgMembership: {
      forward: {
        on: "workspaceCommentAccess",
        has: "one",
        label: "orgMembership",
      },
      reverse: {
        on: "orgMemberships",
        has: "many",
        label: "commentGrants",
      },
    },
    commentAccessWorkspace: {
      forward: {
        on: "workspaceCommentAccess",
        has: "one",
        label: "workspace",
      },
      reverse: {
        on: "workspaces",
        has: "many",
        label: "commenters",
      },
    },
    editAccessOrgMembership: {
      forward: {
        on: "workspaceEditAccess",
        has: "one",
        label: "orgMembership",
      },
      reverse: {
        on: "orgMemberships",
        has: "many",
        label: "editGrants",
      },
    },
    editAccessWorkspace: {
      forward: {
        on: "workspaceEditAccess",
        has: "one",
        label: "workspace",
      },
      reverse: {
        on: "workspaces",
        has: "many",
        label: "editors",
      },
    },
    // --- Data scoping links ---
    candidateWorkspace: {
      forward: {
        on: "candidates",
        has: "one",
        label: "workspace",
      },
      reverse: {
        on: "workspaces",
        has: "many",
        label: "candidates",
      },
    },
    positionWorkspace: {
      forward: {
        on: "positions",
        has: "one",
        label: "workspace",
      },
      reverse: {
        on: "workspaces",
        has: "many",
        label: "positions",
      },
    },
    // --- Comment links ---
    commentCandidate: {
      forward: {
        on: "comments",
        has: "one",
        label: "candidate",
      },
      reverse: {
        on: "candidates",
        has: "many",
        label: "comments",
      },
    },
    commentAuthor: {
      forward: {
        on: "comments",
        has: "one",
        label: "author",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "comments",
      },
    },
    // --- Invite links ---
    inviteOrganization: {
      forward: {
        on: "invites",
        has: "one",
        label: "organization",
      },
      reverse: {
        on: "organizations",
        has: "many",
        label: "invites",
      },
    },
    inviteWorkspace: {
      forward: {
        on: "invites",
        has: "one",
        label: "workspace",
      },
      reverse: {
        on: "workspaces",
        has: "many",
        label: "invites",
      },
    },
    inviteInviter: {
      forward: {
        on: "invites",
        has: "one",
        label: "inviter",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "sentInvites",
      },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
