import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { id } from "@instantdb/react";
import { db } from "./db";

type OrgRole = "owner" | "admin" | "member";

type WorkspaceContextValue = {
  currentOrg: { id: string; name: string } | null;
  currentWorkspace: { id: string; name: string } | null;
  currentOrgRole: OrgRole | null;
  orgMemberships: any[];
  switchOrg: (orgId: string) => void;
  switchWorkspace: (workspaceId: string) => void;
  withWorkspace: (tx: any) => any;
  hasAccess: boolean;
  hasCommentAccess: boolean;
  hasEditAccess: boolean;
  isOrgAdmin: boolean;
  isLoading: boolean;
  needsProvisioning: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const STORAGE_KEY = "tinyats-workspace";

function getSavedSelection(userId: string): { orgId?: string; workspaceId?: string } {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSelection(userId: string, orgId: string, workspaceId: string) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify({ orgId, workspaceId }));
  } catch {
    // localStorage unavailable
  }
}

export function WorkspaceProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

  const { isLoading, data } = db.useQuery({
    orgMemberships: {
      $: { where: { "user.id": userId } },
      organization: { workspaces: {}, adminAccess: { user: {} } },
      accessGrants: { workspace: {} },
      commentGrants: { workspace: {} },
      editGrants: { workspace: {} },
    },
  });

  const memberships = data?.orgMemberships ?? [];

  // Auto-select org/workspace from saved state or first available
  useEffect(() => {
    if (isLoading || memberships.length === 0) return;

    const saved = getSavedSelection(userId);

    // Check if saved org still exists in memberships
    const savedMembership = saved.orgId
      ? memberships.find((m: any) => m.organization?.id === saved.orgId)
      : null;

    if (savedMembership && saved.workspaceId) {
      const hasWs = savedMembership.organization?.workspaces?.some(
        (w: any) => w.id === saved.workspaceId
      );
      if (hasWs) {
        setSelectedOrgId(saved.orgId!);
        setSelectedWsId(saved.workspaceId);
        return;
      }
    }

    // Fall back to first org/workspace
    const firstMembership = memberships[0];
    const firstOrg = firstMembership?.organization;
    const firstWs = firstOrg?.workspaces?.[0];
    if (firstOrg && firstWs) {
      setSelectedOrgId(firstOrg.id);
      setSelectedWsId(firstWs.id);
      saveSelection(userId, firstOrg.id, firstWs.id);
    }
  }, [isLoading, memberships, userId]);

  // Derive current state
  const currentMembership = useMemo(
    () => memberships.find((m: any) => m.organization?.id === selectedOrgId) ?? null,
    [memberships, selectedOrgId]
  );

  const currentOrg = currentMembership?.organization
    ? { id: currentMembership.organization.id, name: currentMembership.organization.name }
    : null;

  const currentWorkspace = useMemo(() => {
    if (!currentMembership || !selectedWsId) return null;
    const ws = currentMembership.organization?.workspaces?.find(
      (w: any) => w.id === selectedWsId
    );
    return ws ? { id: ws.id, name: ws.name } : null;
  }, [currentMembership, selectedWsId]);

  const currentOrgRole = (currentMembership?.role as OrgRole) ?? null;

  // Derive permission flags from access grants
  const hasAccess = useMemo(() => {
    if (!currentMembership || !selectedWsId) return false;
    return (currentMembership.accessGrants ?? []).some(
      (g: any) => g.workspace?.id === selectedWsId
    );
  }, [currentMembership, selectedWsId]);

  const hasCommentAccess = useMemo(() => {
    if (!currentMembership || !selectedWsId) return false;
    return (currentMembership.commentGrants ?? []).some(
      (g: any) => g.workspace?.id === selectedWsId
    );
  }, [currentMembership, selectedWsId]);

  const hasEditAccess = useMemo(() => {
    if (!currentMembership || !selectedWsId) return false;
    return (currentMembership.editGrants ?? []).some(
      (g: any) => g.workspace?.id === selectedWsId
    );
  }, [currentMembership, selectedWsId]);

  const isOrgAdmin = useMemo(() => {
    if (!currentMembership || !userId) return false;
    return (currentMembership.organization?.adminAccess ?? []).some(
      (a: any) => a.user?.id === userId
    );
  }, [currentMembership, userId]);

  const switchOrg = useCallback(
    (orgId: string) => {
      const membership = memberships.find((m: any) => m.organization?.id === orgId);
      if (!membership) return;
      const firstWs = membership.organization?.workspaces?.[0];
      setSelectedOrgId(orgId);
      if (firstWs) {
        setSelectedWsId(firstWs.id);
        saveSelection(userId, orgId, firstWs.id);
      }
    },
    [memberships, userId]
  );

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      setSelectedWsId(workspaceId);
      if (selectedOrgId) {
        saveSelection(userId, selectedOrgId, workspaceId);
      }
    },
    [userId, selectedOrgId]
  );

  const withWorkspace = useCallback(
    (tx: any) => (currentWorkspace ? tx.link({ workspace: currentWorkspace.id }) : tx),
    [currentWorkspace]
  );

  const needsProvisioning = !isLoading && memberships.length === 0;

  const value: WorkspaceContextValue = {
    currentOrg,
    currentWorkspace,
    currentOrgRole,
    orgMemberships: memberships,
    switchOrg,
    switchWorkspace,
    withWorkspace,
    hasAccess,
    hasCommentAccess,
    hasEditAccess,
    isOrgAdmin,
    isLoading,
    needsProvisioning,
  };

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}

export function useWorkspaceQuery<Q extends Record<string, any>>(query: Q) {
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
  }, [wsId, JSON.stringify(query)]);

  return db.useQuery(scopedQuery);
}
