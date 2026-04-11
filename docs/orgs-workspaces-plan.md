# Organizations & Workspaces Implementation

## Context

TinyATS currently has no multi-tenancy — all candidates and positions are visible to any authenticated user (permissions are just `auth.id != null`). We need orgs and workspaces to scope data from the start.

**Hierarchy:** Organization → Workspaces → Data (candidates, positions, comments)

**Access model:** Users are invited to orgs as members. Org admins assign per-workspace permission levels: **read**, **comment**, or **edit**. A direct workspace invite auto-creates the org membership with that single workspace permission.

**Permission enforcement:** ALL permissions are DB-enforced. Since `data.ref()` can traverse links but cannot filter by attribute values, we use **three separate permission entities** — one per access tier. A user's tier is determined by which entities exist, not by a field value:

- **`workspaceAccess`** — all members get this → gates `view`
- **`workspaceCommentAccess`** — comment + edit members get this → gates comment `create`
- **`workspaceEditAccess`** — edit members only → gates candidate/position `create/update/delete`

Granting "read" creates 1 record. Granting "comment" creates 2. Granting "edit" creates all 3.

**React context** provides the current workspace to the app, so all queries are automatically scoped without manual filtering.

---

## TDD Execution Order

Steps below are reference material. Execute in this TDD order:

### Phase 1: Foundation (prerequisite)
1. **Step 1** — Push schema (entities + links). Tests need the schema to exist.
2. **Step 6** — Push permissions. Tests validate these rules.
3. Install test dependencies (vitest, @testing-library/react, jsdom)

### Phase 2: RED — Write failing tests
4. **Step 10** — Write permission test suite (tests/permissions/). All tests should FAIL because no test fixture data exists yet and the app code doesn't exist.
5. **Step 11** — Write React integration tests (tests/react/). All tests should FAIL because hooks/components don't implement workspace scoping yet.

### Phase 3: GREEN — Implement to make tests pass
6. **Step 10 setup.ts** — Implement test fixture creation so permission tests can run against real DB.
7. **Step 2** — Migration script (validates admin SDK patterns used in fixture).
8. **Step 3** — Workspace context + `useWorkspaceQuery` + `withWorkspace`.
9. **Step 4** — Provisioning gate.
10. **Step 5** — Scope queries & mutations in existing components.
11. **Step 8** — Comments UI.
12. Run `bun run test` — all permission + React tests should now PASS.

### Phase 4: Features (not test-driven)
13. **Step 7** — Org/workspace switcher UI.
14. **Step 9** — Invite flow.
15. **Step 2** — Run migration script on production data.

---

## Step 1: Schema Changes (`src/instant.schema.ts`)

### New Entities

```
organizations:          { name: string (indexed), createdAt: number (indexed) }
workspaces:             { name: string (indexed), createdAt: number (indexed) }
orgMemberships:         { role: string (indexed: "owner"/"admin"/"member"), createdAt: number (indexed) }
workspaceAccess:        { createdAt: number (indexed) }
workspaceCommentAccess: { createdAt: number (indexed) }
workspaceEditAccess:    { createdAt: number (indexed) }
comments:               { body: string, createdAt: number (indexed) }
```

### New Links

```
orgWorkspace:
  forward: workspaces → has one → organizations (label: "organization")
  reverse: organizations → has many → workspaces (label: "workspaces")

orgOrgMembership:
  forward: orgMemberships → has one → organizations (label: "organization")
  reverse: organizations → has many → orgMemberships (label: "orgMemberships")

orgMembershipUser:
  forward: orgMemberships → has one → $users (label: "user")
  reverse: $users → has many → orgMemberships (label: "orgMemberships")

# --- Three access tier links (each tier → orgMembership + workspace) ---

accessOrgMembership:
  forward: workspaceAccess → has one → orgMemberships (label: "orgMembership")
  reverse: orgMemberships → has many → workspaceAccess (label: "accessGrants")

accessWorkspace:
  forward: workspaceAccess → has one → workspaces (label: "workspace")
  reverse: workspaces → has many → workspaceAccess (label: "access")

commentAccessOrgMembership:
  forward: workspaceCommentAccess → has one → orgMemberships (label: "orgMembership")
  reverse: orgMemberships → has many → workspaceCommentAccess (label: "commentGrants")

commentAccessWorkspace:
  forward: workspaceCommentAccess → has one → workspaces (label: "workspace")
  reverse: workspaces → has many → workspaceCommentAccess (label: "commenters")

editAccessOrgMembership:
  forward: workspaceEditAccess → has one → orgMemberships (label: "orgMembership")
  reverse: orgMemberships → has many → workspaceEditAccess (label: "editGrants")

editAccessWorkspace:
  forward: workspaceEditAccess → has one → workspaces (label: "workspace")
  reverse: workspaces → has many → workspaceEditAccess (label: "editors")

# --- Data scoping links ---

candidateWorkspace:
  forward: candidates → has one → workspaces (label: "workspace")
  reverse: workspaces → has many → candidates (label: "candidates")

positionWorkspace:
  forward: positions → has one → workspaces (label: "workspace")
  reverse: workspaces → has many → positions (label: "positions")

# --- Comment links ---

commentCandidate:
  forward: comments → has one → candidates (label: "candidate")
  reverse: candidates → has many → comments (label: "comments")

commentAuthor:
  forward: comments → has one → $users (label: "author")
  reverse: $users → has many → comments (label: "comments")
```

Existing `candidatePosition` link and all entity fields stay unchanged.

### Deploy: push schema + perms together in Phase 1 (TDD needs both to validate rules)

---

## Step 2: Migration Script (`scripts/migrate-to-workspaces.ts`)

One-time admin script to link existing data to a default org/workspace. Uses admin SDK.

1. Create a default organization ("TinyATS")
2. Create a default workspace ("Default") linked to that org
3. For all existing `$users`: create `orgMembership` (role: "owner") + all three access entities (access + comment + edit)
4. Link all existing candidates and positions to the default workspace

Run this BEFORE pushing new permissions, so no data becomes invisible.

---

## Step 3: Workspace Context (`src/lib/workspace-context.tsx` — new)

React context providing org/workspace state **and scoped DB helpers** to the entire app. Components never manually inject workspace filters or links — the context handles it.

**Internal query (fetches user's org/workspace graph):**
```ts
db.useQuery({
  orgMemberships: {
    $: { where: { "user.id": userId } },
    organization: { workspaces: {} },
    accessGrants: { workspace: {} },
    commentGrants: { workspace: {} },
    editGrants: { workspace: {} },
  },
})
```

**Context value:**
```ts
{
  currentOrg, currentWorkspace,
  currentOrgRole,        // "owner" | "admin" | "member"
  orgMemberships,        // all user's org memberships with nested data
  switchOrg(orgId), switchWorkspace(workspaceId),

  // --- Scoped DB helper ---
  withWorkspace,         // chains .link({ workspace: wsId }) onto a transaction

  // --- Permission flags (for UI gating; DB enforces independently) ---
  hasAccess,             // has workspaceAccess for current workspace
  hasCommentAccess,      // has workspaceCommentAccess for current workspace
  hasEditAccess,         // has workspaceEditAccess for current workspace
  isOrgAdmin,            // role === "owner" || role === "admin"
  isLoading, needsProvisioning,
}
```

**`useWorkspaceQuery(query)`** — a standalone hook (not on the context) that wraps `db.useQuery`, auto-injecting workspace scope:
```ts
// src/lib/workspace-context.tsx (exported alongside the context)
function useWorkspaceQuery<Q extends Record<string, any>>(query: Q) {
  const { currentWorkspace } = useWorkspace();
  const wsId = currentWorkspace?.id;
  const scopedQuery = useMemo(() => {
    if (!wsId) return query;
    const scoped: any = {};
    for (const [key, val] of Object.entries(query)) {
      scoped[key] = {
        ...val,
        $: { ...val?.$, where: { ...val?.$?.where, "workspace.id": wsId } },
      };
    }
    return scoped;
  }, [wsId, JSON.stringify(query)]);  // serialize for stable comparison
  return db.useQuery(scopedQuery);
}
```
This is a proper React hook — follows rules of hooks, and components don't import `db` for reads.

**`withWorkspace(tx)`** — on the context, chains `.link({ workspace })` onto a transaction:
```ts
const withWorkspace = useCallback(
  (tx: any) => currentWorkspace ? tx.link({ workspace: currentWorkspace.id }) : tx,
  [currentWorkspace?.id]
);
```

**How tier is derived:** For the current workspace, check if a matching `workspaceAccess`/`workspaceCommentAccess`/`workspaceEditAccess` record exists in the user's orgMembership grants. This is purely for UI gating — the DB independently enforces the same thing.

**Selection persistence:** `localStorage` keyed by user ID stores `{ orgId, workspaceId }`.

**Auto-provisioning:** If zero orgMemberships and not loading → `needsProvisioning = true`.

---

## Step 4: Provisioning Gate (`src/routes/index.tsx`)

Sits between auth gate and the workspace provider. When `needsProvisioning`:

**No pending invites → create personal org:**
```ts
const orgId = id(), wsId = id(), membershipId = id();
const accessId = id(), commentId = id(), editId = id();
db.transact([
  db.tx.organizations[orgId].update({ name: "My Organization", createdAt: Date.now() }),
  db.tx.workspaces[wsId].update({ name: "Default", createdAt: Date.now() })
    .link({ organization: orgId }),
  db.tx.orgMemberships[membershipId].update({ role: "owner", createdAt: Date.now() })
    .link({ organization: orgId, user: user.id }),
  // All three tiers for owner
  db.tx.workspaceAccess[accessId].update({ createdAt: Date.now() })
    .link({ orgMembership: membershipId, workspace: wsId }),
  db.tx.workspaceCommentAccess[commentId].update({ createdAt: Date.now() })
    .link({ orgMembership: membershipId, workspace: wsId }),
  db.tx.workspaceEditAccess[editId].update({ createdAt: Date.now() })
    .link({ orgMembership: membershipId, workspace: wsId }),
]);
```

Use a `useRef` flag to prevent double-execution.

---

## Step 5: Scope Queries & Mutations

All components use `useWorkspaceQuery` for reads and `withWorkspace` for writes — no manual workspace plumbing.

### `src/components/pages/current-recruitments.tsx`

```ts
// Before
const { data } = db.useQuery({ candidates: { position: {} } })

// After — useWorkspaceQuery auto-scopes to current workspace
const { data } = useWorkspaceQuery({
  candidates: { position: {}, comments: { author: {} } }
});
// Equivalent to: db.useQuery({ candidates: { $: { where: { "workspace.id": wsId } }, ... } })
```

### `src/components/candidates/cv-drop-zone.tsx`

```ts
const { withWorkspace, hasEditAccess } = useWorkspace();

// withWorkspace auto-links to current workspace
db.transact(
  withWorkspace(db.tx.candidates[candidateId].update({ name, status: "Processing" }))
);
```

Hide drop zone entirely when `!hasEditAccess` (DB would reject the transaction anyway).

### `src/components/candidates/kanban-board.tsx`

Disable drag-and-drop when `!hasEditAccess`.

### `src/components/candidates/candidate-table.tsx`

Make star ratings read-only when `!hasEditAccess`.

### `src/components/candidates/kanban-card.tsx`

Hide edit affordances when `!hasEditAccess`. Show comment button when `hasCommentAccess`.

---

## Step 6: Push Permissions (`src/instant.perms.ts`)

Push perms AFTER data migration and query scoping are deployed. Every rule is DB-enforced — no app-level permission checks needed for security.

```ts
{
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
      create: "auth.id != null",
      update: "auth.id in data.ref('editors.orgMembership.user.id')",
      delete: "false",
    },
  },
  orgMemberships: {
    allow: {
      view: "auth.id in data.ref('organization.orgMemberships.user.id')",
      create: "auth.id != null",
      update: "auth.id in data.ref('organization.orgMemberships.user.id')",
      delete: "auth.id in data.ref('organization.orgMemberships.user.id')",
    },
  },
  workspaceAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "auth.id != null",
      update: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      delete: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  workspaceCommentAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "auth.id != null",
      update: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      delete: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  workspaceEditAccess: {
    allow: {
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      create: "auth.id != null",
      update: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
      delete: "auth.id in data.ref('workspace.editors.orgMembership.user.id')",
    },
  },
  candidates: {
    allow: {
      // View: any workspace member
      view: "auth.id in data.ref('workspace.access.orgMembership.user.id')",
      // Create/update/delete: editors only
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
      // View: any workspace member (through candidate → workspace)
      view: "auth.id in data.ref('candidate.workspace.access.orgMembership.user.id')",
      // Create: comment-tier and above
      create: "auth.id in data.ref('candidate.workspace.commenters.orgMembership.user.id')",
      // Update: author only
      update: "auth.id in data.ref('author.id')",
      // Delete: author OR workspace editors
      delete: "auth.id in data.ref('author.id') || auth.id in data.ref('candidate.workspace.editors.orgMembership.user.id')",
    },
  },
}
```

**Key `data.ref` paths and what they enforce:**
| Path | Traversal | Meaning |
|------|-----------|---------|
| `workspace.access.orgMembership.user.id` | entity → workspace → workspaceAccess → orgMembership → $user | "has read access" |
| `workspace.commenters.orgMembership.user.id` | entity → workspace → workspaceCommentAccess → orgMembership → $user | "has comment access" |
| `workspace.editors.orgMembership.user.id` | entity → workspace → workspaceEditAccess → orgMembership → $user | "has edit access" |
| `candidate.workspace.*.orgMembership.user.id` | comment → candidate → workspace → ... | "has access via candidate's workspace" |
| `author.id` | comment → $user | "is comment author" |

---

## Step 7: Org/Workspace Switcher UI

### `src/components/layout/workspace-switcher.tsx` (new)

Replaces the static team selector button in TopNav (lines 33–44).

Shows: `[Org Icon] Org Name > Workspace Name [chevron]`

Dropdown has two sections:
- **Organizations:** list orgs, switch org
- **Workspaces in current org:** list workspaces, switch workspace
- "+ Create workspace" at bottom (only if `isOrgAdmin`)

### `src/components/layout/top-nav.tsx`

Replace the hardcoded team button with `<WorkspaceSwitcher />`.

---

## Step 8: Comments UI

### Candidate detail / inline comments

- Each candidate card (kanban) or row (table) can expand to show comments
- Comment input visible when `hasCommentAccess` (context check for UX; DB enforces on write)
- Comments display author name, timestamp, body
- Author can edit/delete their own comments; editors can delete any comment

---

## Step 9: Invite Flow

### New entity: `invites`

```
invites: { email: string (indexed), level: string (indexed: "read"/"comment"/"edit"), status: string (indexed), createdAt: number (indexed) }
```

Links: invite → organization, invite → workspace, invite → inviter ($users)

### Org-level invite (admin picks user + workspace permissions)

1. Admin enters email, selects workspaces + level per workspace
2. Creates `invite` records (one per workspace)
3. If user already exists in `$users`:
   - Create `orgMembership` + appropriate access tier entities immediately
   - Mark invites as "accepted"
4. If user doesn't exist yet:
   - Invites stay "pending"
   - On signup, provisioning gate checks for pending invites by email and applies them

### Granting permissions (helper logic)

| Level | Creates |
|-------|---------|
| read | `workspaceAccess` |
| comment | `workspaceAccess` + `workspaceCommentAccess` |
| edit | `workspaceAccess` + `workspaceCommentAccess` + `workspaceEditAccess` |

### Direct workspace invite

Same as org-level but scoped to one workspace. Auto-creates org membership with role "member" + corresponding access tier entities for that workspace.

### UI: `src/components/pages/org-settings.tsx` (new) + `src/routes/settings.tsx` (new)

- Members tab: list org members with their per-workspace access tiers
- Invite form: email + workspace/level selector
- Remove member button (org owners/admins only)

---

## Step 10: Permission Test Suite (`tests/permissions/`)

Browserless end-to-end tests using the **InstantDB admin SDK** with real database access. No React rendering needed — the admin SDK provides `db.asUser({ token }).debugQuery()` and `db.asUser({ token }).debugTransact()` to test permissions as impersonated users.

### Dependencies

Add to devDependencies:
```
vitest                        — test runner (shares Vite config)
@testing-library/react        — renderHook + render for React tests
@testing-library/jest-dom     — DOM matchers
jsdom                         — browser environment for vitest
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:permissions": "vitest run tests/permissions",
"test:react": "vitest run tests/react"
```

Add `vitest.config.ts` extending vite config, with `environment: 'jsdom'` for React test files.

### Test fixture helper (`tests/permissions/setup.ts`)

Creates a complete test world using admin SDK, runs once before the suite:

```ts
import { init, id } from "@instantdb/admin";

// Creates:
// - 1 org, 2 workspaces (wsA, wsB)
// - 4 test users with auth tokens:
//   - readUser    → workspaceAccess on wsA only
//   - commentUser → workspaceAccess + workspaceCommentAccess on wsA
//   - editUser    → all three tiers on wsA
//   - outsideUser → workspaceAccess on wsB only (no access to wsA)
// - 1 candidate in wsA, 1 candidate in wsB
// - 1 position in wsA
// - 1 comment on wsA candidate by editUser

async function createTestFixture() {
  const db = init({ appId, adminToken, schema });

  // Create 4 users and get auth tokens
  const readToken    = await db.auth.createToken({ email: "read@test.com" });
  const commentToken = await db.auth.createToken({ email: "comment@test.com" });
  const editToken    = await db.auth.createToken({ email: "edit@test.com" });
  const outsideToken = await db.auth.createToken({ email: "outside@test.com" });

  // Build org, workspaces, memberships, access tiers, candidates, comments via db.transact
  // ...return { db, tokens, entityIds }
}
```

### Teardown (`afterAll`)

Uses admin SDK to delete all test entities created during setup.

### Test files

**`tests/permissions/read-tier.test.ts`** — readUser on wsA:
```ts
describe("read-tier user", () => {
  it("can view candidates in their workspace");        // debugQuery → checkResults all pass
  it("cannot view candidates in other workspaces");    // debugQuery → wsB candidate not returned
  it("cannot create candidates");                       // debugTransact → all-checks-ok? = false
  it("cannot update candidates");
  it("cannot delete candidates");
  it("can view comments");
  it("cannot create comments");                         // no workspaceCommentAccess
  it("can view positions in their workspace");
  it("cannot create/update/delete positions");
});
```

**`tests/permissions/comment-tier.test.ts`** — commentUser on wsA:
```ts
describe("comment-tier user", () => {
  it("can view candidates");
  it("cannot create/update/delete candidates");
  it("can create comments on candidates in their workspace");
  it("can update own comments");                        // author check
  it("can delete own comments");
  it("cannot update other users' comments");
  it("cannot delete other users' comments");            // not author, not editor
});
```

**`tests/permissions/edit-tier.test.ts`** — editUser on wsA:
```ts
describe("edit-tier user", () => {
  it("can view candidates");
  it("can create candidates");
  it("can update candidates");
  it("can delete candidates");
  it("can create/update/delete positions");
  it("can create comments");
  it("can delete any comment");                         // editor privilege
  it("cannot update other users' comments");            // only author can update
});
```

**`tests/permissions/isolation.test.ts`** — cross-workspace:
```ts
describe("workspace isolation", () => {
  it("outsideUser cannot view wsA candidates");
  it("outsideUser cannot view wsA comments");
  it("outsideUser can view wsB candidates");
  it("editUser on wsA cannot modify wsB candidates");
});
```

**`tests/permissions/org-access.test.ts`** — org/membership permissions:
```ts
describe("org-level permissions", () => {
  it("members can view their own org");
  it("members cannot view other orgs");
  it("any authenticated user can create an org");       // for provisioning
  it("members can view org memberships within their org");
});
```

### Test execution pattern

Each test uses `db.asUser({ token }).debugQuery()` or `db.asUser({ token }).debugTransact()`:

```ts
it("read user cannot create candidates", async () => {
  const result = await db.asUser({ token: readToken }).debugTransact([
    db.tx.candidates[id()].update({ name: "Test", status: "New" })
      .link({ workspace: wsAId }),
  ]);
  expect(result["all-checks-ok?"]).toBe(false);
});

it("read user can view wsA candidates", async () => {
  const result = await db.asUser({ token: readToken }).debugQuery({
    candidates: { $: { where: { "workspace.id": wsAId } } },
  });
  expect(result.result.candidates.length).toBeGreaterThan(0);
});
```

### Run: `bun run test:permissions`

---

## Step 11: React Integration Tests (`tests/react/`)

React rendering tests with **real database access** using `@testing-library/react`. Tests verify that hooks derive correct state from live InstantDB data, and components gate UI correctly.

### Approach

Uses the same test fixture from `tests/permissions/setup.ts`. Each test:
1. Initializes `@instantdb/react` with a test-user auth token
2. Renders hooks/components via `renderHook` / `render`
3. Waits for real-time data with `waitFor`
4. Asserts on derived values and rendered output

**Auth flow per test user:**
```ts
// Setup: admin SDK creates tokens
const editToken = await adminDb.auth.createToken({ email: "edit@test.com" });

// In test: sign in the client-side db, then render
await db.auth.signInWithToken(editToken);
const { result } = renderHook(() => useWorkspace(), { wrapper: WorkspaceProvider });
await waitFor(() => expect(result.current.isLoading).toBe(false));
```

### Test files

**`tests/react/use-workspace.test.tsx`** — `useWorkspace` hook:
```ts
describe("useWorkspace hook", () => {
  it("returns hasEditAccess=true for edit-tier user");
  it("returns hasCommentAccess=true, hasEditAccess=false for comment-tier user");
  it("returns hasAccess=true, hasCommentAccess=false for read-tier user");
  it("returns correct currentOrg and currentWorkspace");
  it("returns isOrgAdmin=true for owner-role membership");
  it("withWorkspace chains .link({ workspace }) correctly");
  it("returns needsProvisioning=true for user with no memberships");
});
```

**`tests/react/use-workspace-query.test.tsx`** — `useWorkspaceQuery` hook:
```ts
describe("useWorkspaceQuery hook", () => {
  it("returns only candidates in current workspace");
  it("returns empty when no candidates exist in workspace");
  it("includes nested relations (position, comments)");
  it("re-queries when workspace changes via switchWorkspace");
});
```

**`tests/react/permission-gating.test.tsx`** — component-level permission gating:
```ts
describe("component permission gating", () => {
  it("cv-drop-zone is hidden for read-tier user");
  it("cv-drop-zone is visible for edit-tier user");
  it("kanban drag handles are disabled for read-tier user");
  it("comment input is hidden for read-tier user");
  it("comment input is visible for comment-tier user");
  it("candidate edit buttons are hidden for comment-tier user");
});
```

### Constraint: sequential user tests

`@instantdb/react`'s `init()` creates a singleton. Tests for different users must run sequentially (sign out → sign in as next user). Use `beforeEach` to switch user:
```ts
afterEach(async () => { await db.auth.signOut(); });
```

### Run: `bun run test:react`

---

## Files Summary

### New files
| File | Purpose |
|------|---------|
| `src/lib/workspace-context.tsx` | WorkspaceProvider + useWorkspace + useWorkspaceQuery hooks |
| `src/components/layout/workspace-switcher.tsx` | Org/workspace selector dropdown |
| `src/components/pages/org-settings.tsx` | Member management + invites |
| `src/routes/settings.tsx` | TanStack route for settings page |
| `scripts/migrate-to-workspaces.ts` | One-time migration for existing data |
| `vitest.config.ts` | Vitest configuration extending Vite config |
| `tests/permissions/setup.ts` | Test fixture: creates org/ws/users/access/data |
| `tests/permissions/read-tier.test.ts` | Read-tier permission tests |
| `tests/permissions/comment-tier.test.ts` | Comment-tier permission tests |
| `tests/permissions/edit-tier.test.ts` | Edit-tier permission tests |
| `tests/permissions/isolation.test.ts` | Cross-workspace isolation tests |
| `tests/permissions/org-access.test.ts` | Org-level permission tests |
| `tests/react/use-workspace.test.tsx` | useWorkspace hook integration tests |
| `tests/react/use-workspace-query.test.tsx` | useWorkspaceQuery scoping tests |
| `tests/react/permission-gating.test.tsx` | Component permission gating tests |

### Modified files
| File | Change |
|------|--------|
| `package.json` | Add vitest devDependency, test scripts |
| `src/instant.schema.ts` | Add 7 entities (orgs, workspaces, orgMemberships, 3 access tiers, comments) + invites + 15 links |
| `src/instant.perms.ts` | Fully DB-enforced per-tier permissions |
| `src/routes/index.tsx` | Add provisioning gate + WorkspaceProvider wrapper |
| `src/components/pages/current-recruitments.tsx` | Use useWorkspaceQuery, include comments |
| `src/components/candidates/cv-drop-zone.tsx` | Use withWorkspace, hide when !hasEditAccess |
| `src/components/candidates/kanban-board.tsx` | Disable drag when !hasEditAccess |
| `src/components/candidates/candidate-table.tsx` | Read-only ratings when !hasEditAccess |
| `src/components/candidates/kanban-card.tsx` | Hide edit affordances, show comment UI |
| `src/components/layout/top-nav.tsx` | Replace team button with WorkspaceSwitcher |
| `scripts/seed.ts` | Create org/workspace/access hierarchy with seed data |

---

## Performance Analysis

### 1. `data.ref` traversal depth (main bottleneck risk)

| Entity | Longest path | Hops |
|--------|-------------|------|
| candidates/positions | `workspace.editors.orgMembership.user.id` | 4 |
| comments | `candidate.workspace.commenters.orgMembership.user.id` | 5 |

Each hop is an index-backed join on InstantDB's server. For typical workspace sizes (< 100 members), latency is negligible. **Risk at scale:** A workspace with 1000+ members means each `data.ref` traversal resolves 1000+ user IDs per permission check. This affects every read and write.

**Mitigation:** Not a concern for an ATS — workspaces rarely exceed 50 hiring team members. If needed later, InstantDB could add permission caching, but this is out of our control.

### 2. Three permission entities per member = 3× storage

An "edit" user creates 3 records per workspace. A workspace with 50 editors = 150 permission records (each is just a `createdAt` field + 2 links). Negligible storage cost.

**Key insight:** Each `data.ref` path only traverses ONE of the three entity types. A `view` check traverses `workspaceAccess` only, never touching `workspaceCommentAccess` or `workspaceEditAccess`. So the fanout per check is bounded by members at that tier, not total members × 3.

### 3. Context query breadth

The workspace context fetches all orgMemberships × all grant types × workspaces for the user. A user in 10 orgs with 5 workspaces each = 50 workspace entries + up to 150 grant records.

**Mitigation:** This is a single real-time subscription. InstantDB pushes incremental updates after the initial load — so cost is paid once. The query is for the **current user only** (filtered by `user.id`), not all users.

### 4. `useWorkspaceQuery` re-subscriptions

`useWorkspaceQuery` creates a new scoped query object when workspace changes. The `useMemo` with `JSON.stringify(query)` ensures stable references when the input doesn't change. `db.useQuery` internally deduplicates subscriptions by query shape.

**Risk:** `JSON.stringify` on every render has ~0.01ms cost for small query objects — negligible. If a component passes a non-serializable query (unlikely), it would re-subscribe every render.

### 5. Workspace switching

Switching workspace invalidates all `useWorkspaceQuery` hooks simultaneously, triggering re-subscriptions across the app. This is user-initiated and infrequent — a brief loading flash is acceptable. No mitigation needed.

### Verdict

No blocking bottlenecks for ATS-scale usage (tens of members, hundreds of candidates). The 5-hop comment permission path is the deepest traversal; monitor if workspaces grow to 500+ members.

---

## Verification

### Automated (run after schema + perms are pushed)
1. `bun run build` — no type errors
2. `bun run test:permissions` — backend permission suite (read/comment/edit tiers + isolation + org access)
3. `bun run test:react` — React integration suite (hooks + component permission gating)
4. `bun run test` — both suites

### Manual (browser)
3. Run migration script — existing data linked to default workspace
4. Sign in as new user → auto-creates personal org + default workspace → sees dashboard
5. Sign in as existing user → sees migrated data in default workspace
6. Create a new workspace → switch to it → empty, no candidates
7. Drop a CV in new workspace → appears only there
8. Sign in as different user → cannot see first user's data
9. Invite user with read/comment/edit and verify UI gates match DB enforcement
10. Verify via browser console: `db.transact()` calls that violate tier are rejected by the DB
