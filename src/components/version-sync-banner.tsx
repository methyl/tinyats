import { useState, useEffect } from "react";

export function VersionSyncBanner() {
  const [mismatch, setMismatch] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (__COMMIT_SHA__ === "dev") return;

    fetch("/api/version")
      .then((r) => r.json())
      .then((data: { commit?: string }) => {
        if (data.commit && data.commit !== __COMMIT_SHA__) {
          setMismatch(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!mismatch || dismissed) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
      <span>Workers are still deploying — some features may not work yet.</span>
      <button
        onClick={() => window.location.reload()}
        className="font-medium underline underline-offset-2 hover:text-amber-900"
      >
        Refresh
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="ml-1 text-amber-400 hover:text-amber-600"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
    </div>
  );
}
