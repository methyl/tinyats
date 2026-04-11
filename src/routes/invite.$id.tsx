import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/db";
import { LoginPage } from "@/components/pages/login";

function AcceptInvitePage() {
  const { id: inviteId } = Route.useParams();
  const { isLoading: authLoading, user } = db.useAuth();
  const [status, setStatus] = useState<"loading" | "accepting" | "accepted" | "error">("loading");
  const [error, setError] = useState("");
  const accepted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user || accepted.current) return;
    accepted.current = true;
    setStatus("accepting");

    const token = (user as any).refresh_token;
    if (!token) {
      setStatus("error");
      setError("Could not authenticate. Please sign in again.");
      return;
    }

    fetch("/api/accept-invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteId }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("accepted");
          // Redirect to home after brief delay
          setTimeout(() => navigate({ to: "/" }), 1500);
        } else {
          const body = await res.json().catch(() => ({}));
          setStatus("error");
          setError((body as any).error || "Failed to accept invite");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Network error");
      });
  }, [authLoading, user, inviteId, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm text-center">
        {status === "loading" || status === "accepting" ? (
          <>
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Accepting invite...</p>
          </>
        ) : status === "accepted" ? (
          <>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10l3.5 3.5L15 7" stroke="#339E68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Invite accepted!</h2>
            <p className="text-sm text-gray-500">Redirecting to your workspace...</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 6v5M10 13.5v.5" stroke="#D13938" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Could not accept invite</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/invite/$id")({
  component: AcceptInvitePage,
});
