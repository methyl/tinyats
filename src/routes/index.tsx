import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
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

  return <CurrentRecruitments />;
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});
