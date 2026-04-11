import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { db } from "@/lib/db";

type AuthStep =
  | { step: "initial" }
  | { step: "code"; email: string }
  | { step: "sending" }
  | { step: "verifying" };

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function MagicCodeForm() {
  const [state, setState] = useState<AuthStep>({ step: "initial" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setState({ step: "sending" });
    try {
      await db.auth.sendMagicCode({ email });
      setState({ step: "code", email });
    } catch (err) {
      setError("Failed to send code. Please try again.");
      setState({ step: "initial" });
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.step !== "code") return;
    setError("");
    setState({ step: "verifying" });
    try {
      await db.auth.signInWithMagicCode({ email: state.email, code });
    } catch (err) {
      setError("Invalid code. Please try again.");
      setState({ step: "code", email: state.email });
    }
  };

  if (state.step === "code" || state.step === "verifying") {
    return (
      <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          We sent a code to <span className="font-medium">{state.email}</span>
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-status-new/40 focus:border-status-new"
          autoFocus
        />
        {error && <p className="text-sm text-status-first-call">{error}</p>}
        <button
          type="submit"
          disabled={state.step === "verifying" || !code}
          className="h-10 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.step === "verifying" ? "Verifying..." : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => {
            setState({ step: "initial" });
            setCode("");
            setError("");
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="flex flex-col gap-3">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-status-new/40 focus:border-status-new"
        autoFocus
      />
      {error && <p className="text-sm text-status-first-call">{error}</p>}
      <button
        type="submit"
        disabled={state.step === "sending" || !email}
        className="h-10 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.step === "sending" ? "Sending code..." : "Continue with email"}
      </button>
    </form>
  );
}

function GoogleSignIn() {
  const [nonce] = useState(() => crypto.randomUUID());
  const [error, setError] = useState("");

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col items-center gap-2">
        <GoogleLogin
          nonce={nonce}
          onSuccess={async ({ credential }) => {
            if (!credential) return;
            try {
              await db.auth.signInWithIdToken({
                clientName: "google-web",
                idToken: credential,
                nonce,
              });
            } catch {
              setError("Google sign-in failed. Please try again.");
            }
          }}
          onError={() => setError("Google sign-in failed.")}
          shape="rectangular"
          width="100%"
          text="continue_with"
        />
        {error && <p className="text-sm text-status-first-call">{error}</p>}
      </div>
    </GoogleOAuthProvider>
  );
}

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">TinyATS</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
          </div>

          {/* Google */}
          <GoogleSignIn />

          {/* Divider */}
          {GOOGLE_CLIENT_ID && (
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* Magic code */}
          <MagicCodeForm />
        </div>
      </div>
    </div>
  );
}
