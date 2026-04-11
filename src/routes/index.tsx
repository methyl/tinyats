import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { db } from "@/lib/db";
import { WorkspaceProvider, useWorkspace } from "@/lib/workspace-context";
import { CurrentRecruitments } from "@/components/pages/current-recruitments";
import { LoginPage } from "@/components/pages/login";

function IndexPage() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <WorkspaceProvider userId={user.id}>
      <ProvisioningGate />
    </WorkspaceProvider>
  );
}

function ProvisioningGate() {
  const { needsProvisioning, isLoading } = useWorkspace();
  const { user } = db.useAuth();
  const provisioned = useRef(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Setting up workspace...</div>
      </div>
    );
  }

  if (needsProvisioning && !provisioned.current && user) {
    provisioned.current = true;

    const token = (user as any).refresh_token;
    if (token) {
      fetch("/api/provision", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch(() => {});
    }

    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Creating your workspace...</div>
      </div>
    );
  }

  return <CurrentRecruitments />;
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});
