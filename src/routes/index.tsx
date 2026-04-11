import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { db } from "@/lib/db";
import { WorkspaceProvider, useWorkspace } from "@/lib/workspace-context";
import { CurrentRecruitments } from "@/components/pages/current-recruitments";

function AuthGate() {
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
        <div className="text-red-400 text-lg">Auth error: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <WorkspaceProvider userId={user.id}>
      <ProvisioningGate />
    </WorkspaceProvider>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await db.auth.sendMagicCode({ email });
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await db.auth.signInWithMagicCode({ email, code });
    } catch (err: any) {
      setError(err.message || "Invalid code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Welcome to TinyATS</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in with your email</p>

        {step === "email" ? (
          <form onSubmit={handleSendCode}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Send Magic Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <p className="text-sm text-gray-600 mb-3">
              We sent a code to <strong>{email}</strong>
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Use different email
            </button>
          </form>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
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

    // Access tiers can only be created server-side (admin SDK) to prevent
    // privilege escalation. The user's refresh_token authenticates the request.
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
  component: AuthGate,
});
