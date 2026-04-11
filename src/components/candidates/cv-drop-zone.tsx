import { useState, useCallback, useRef, type ReactNode, type DragEvent } from "react";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

type UploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "uploading"; fileName: string }
  | { status: "error"; message: string };

async function uploadCv(file: File): Promise<{ candidateId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-cv", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

type CvDropZoneProps = {
  children: ReactNode;
};

export function CvDropZone({ children }: CvDropZoneProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const dragCounter = useRef(0);
  const errorTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setState({ status: "dragging" });
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setState((s) => (s.status === "dragging" ? { status: "idle" } : s));
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;

    const file = e.dataTransfer.files[0];
    if (!file) {
      setState({ status: "idle" });
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setState({ status: "error", message: "Please upload a PDF or DOCX file." });
      errorTimeout.current = setTimeout(() => setState({ status: "idle" }), 3000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setState({ status: "error", message: "File too large. Maximum 10MB." });
      errorTimeout.current = setTimeout(() => setState({ status: "idle" }), 3000);
      return;
    }

    setState({ status: "uploading", fileName: file.name });

    try {
      await uploadCv(file);
      // Candidate appears automatically via InstantDB subscription
      setState({ status: "idle" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState({ status: "error", message });
      errorTimeout.current = setTimeout(() => setState({ status: "idle" }), 4000);
    }
  }, []);

  const showOverlay = state.status === "dragging";

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Drag overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-status-processing/5 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl border-2 border-dashed border-status-processing/40 bg-white/90 shadow-sm">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">Drop CV to add candidate</p>
              <p className="text-sm text-gray-500 mt-1">PDF or DOCX, up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload toast */}
      {state.status === "uploading" && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-gray-200 shadow-sm">
          <svg className="animate-spin h-4 w-4 text-status-processing" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-700">
            Uploading <span className="font-medium">{state.fileName}</span>...
          </span>
        </div>
      )}

      {/* Error toast */}
      {state.status === "error" && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-status-first-call/30 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#D13938" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 10.5v.5" stroke="#D13938" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-status-first-call">{state.message}</span>
        </div>
      )}
    </div>
  );
}
