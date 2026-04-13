import { createRootRoute, Outlet } from "@tanstack/react-router";
import { VersionSyncBanner } from "@/components/version-sync-banner";
import "@/styles/globals.css";

export const Route = createRootRoute({
  component: () => (
    <>
      <VersionSyncBanner />
      <Outlet />
    </>
  ),
});
