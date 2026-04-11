import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { OrgSettings } from "@/components/pages/org-settings";
import { TopNav } from "@/components/layout/top-nav";

function SettingsPage() {
  const { isLoading, user } = db.useAuth();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <WorkspaceProvider userId={user.id}>
      <div className="min-h-screen bg-gray-800">
        <TopNav />
        <div className="m-2 bg-gray-50 rounded-2xl min-h-[calc(100vh-72px)]">
          <OrgSettings />
        </div>
      </div>
    </WorkspaceProvider>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
