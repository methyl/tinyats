import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { db } from "@/lib/db";
import { StarRating } from "../ui/star-rating";
import {
  ChevronDownIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
} from "../ui/icons";
import { CommentSection } from "./comment-section";
import { type Candidate } from "./types";
import { type CandidateStatus } from "../ui/status-badge";

/* ---------- Small icons used only in the drawer ---------- */

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 3L4.5 7l4 4" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 3L9.5 7l-4 4" />
    </svg>
  );
}

function LinkedInSquareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="0.5" y="0.5" width="13" height="13" rx="3" fill="#0A66C2" />
      <path
        d="M4.5 9.5H3V5.5h1.5V9.5zm-.75-4.6a.85.85 0 110-1.7.85.85 0 010 1.7zm6 4.6h-1.5V7.6c0-.5 0-1.1-.7-1.1s-.8.5-.8.9v2.1H5.3V5.5h1.4v.6h.02c.2-.4.6-.7 1.3-.7 1.4 0 1.7.9 1.7 2V9.5z"
        fill="white"
      />
    </svg>
  );
}

function GitHubSquareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="0.5" y="0.5" width="13" height="13" rx="3" fill="#1B1B1B" />
      <path
        d="M7 2.5A4.5 4.5 0 002.6 8.1c.3.05.4-.1.4-.22v-.8c-1.3.28-1.55-.6-1.55-.6a1.2 1.2 0 00-.5-.66c-.4-.27.03-.27.03-.27.45.04.7.47.7.47.4.7 1.1.5 1.4.38.03-.3.16-.5.3-.62-1-.1-2.05-.5-2.05-2.2 0-.48.18-.88.47-1.2-.05-.1-.2-.58.05-1.2 0 0 .4-.12 1.25.47a4.3 4.3 0 012.3 0c.85-.59 1.25-.47 1.25-.47.25.62.1 1.1.05 1.2.3.32.47.72.47 1.2 0 1.7-1.05 2.1-2.05 2.2.17.14.3.4.3.8v1.2c0 .13.1.28.4.22A4.5 4.5 0 007 2.5z"
        fill="white"
      />
    </svg>
  );
}

function FileIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 1.5H4A1.5 1.5 0 002.5 3v10A1.5 1.5 0 004 14.5h8a1.5 1.5 0 001.5-1.5V5.5L9.5 1.5z" />
      <path d="M9.5 1.5V5.5h4" />
    </svg>
  );
}

function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 11V3M4.5 6.5L8 3l3.5 3.5" />
    </svg>
  );
}

/* ---------- Row helpers ---------- */

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-8">
      <div className="w-20 shrink-0 text-[13px] leading-[1.7] text-gray-900">
        {label}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function InputShell({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center h-8 rounded-lg bg-white border border-gray-300/80 pl-2 pr-3 gap-2 overflow-hidden"
    >
      {children}
    </div>
  );
}

/* ---------- Status palette (matches existing status-badge theme) ---------- */

const statusDotClass: Record<CandidateStatus, string> = {
  Processing: "bg-status-processing",
  New: "bg-status-new",
  Reviewed: "bg-status-reviewed",
  "1st Call": "bg-status-first-call",
  "2nd Call": "bg-status-second-call",
  Deal: "bg-status-deal",
  Hired: "bg-status-hired",
  Rejected: "bg-status-rejected",
};

const ALL_STATUSES: CandidateStatus[] = [
  "New",
  "Reviewed",
  "1st Call",
  "2nd Call",
  "Deal",
  "Hired",
  "Rejected",
];

/* ---------- Dropdown (used for Status + Position) ---------- */

function Dropdown({
  renderValue,
  items,
  onSelect,
}: {
  renderValue: () => ReactNode;
  items: { key: string; label: ReactNode; value: string }[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center h-8 w-full rounded-lg bg-white border border-gray-300/80 pl-2 pr-2 gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0 flex items-center text-left">
          {renderValue()}
        </div>
        <ChevronDownIcon className="text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-30 py-1 max-h-60 overflow-auto">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelect(item.value);
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Drawer ---------- */

export type CandidateDrawerProps = {
  candidate: Candidate | null;
  candidates: Candidate[];
  onClose: () => void;
  onSelect: (id: string) => void;
  positions: string[];
  hasEditAccess?: boolean;
  hasCommentAccess?: boolean;
  currentUserId?: string;
};

export function CandidateDrawer({
  candidate,
  candidates,
  onClose,
  onSelect,
  positions,
  hasEditAccess = true,
  hasCommentAccess = true,
  currentUserId,
}: CandidateDrawerProps) {
  const open = !!candidate;

  const { index, prev, next } = useMemo(() => {
    if (!candidate) return { index: -1, prev: null, next: null };
    const i = candidates.findIndex((c) => c.id === candidate.id);
    return {
      index: i,
      prev: i > 0 ? candidates[i - 1] : null,
      next: i >= 0 && i < candidates.length - 1 ? candidates[i + 1] : null,
    };
  }, [candidate, candidates]);

  // Local state mirrors the candidate fields so edits feel instant.
  // Resets whenever we switch candidate.
  const [form, setForm] = useState(() => fromCandidate(candidate));
  useEffect(() => {
    setForm(fromCandidate(candidate));
  }, [candidate?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      // Don't hijack typing inside inputs
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "Escape") {
        onClose();
      } else if (!typing && (e.key === "ArrowLeft" || e.key === "[")) {
        if (prev) onSelect(prev.id);
      } else if (!typing && (e.key === "ArrowRight" || e.key === "]")) {
        if (next) onSelect(next.id);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, prev, next, onSelect, onClose]);

  if (!candidate) {
    // Always mount the container so transitions work when a candidate gets selected.
    return <DrawerShell open={false} onClose={onClose} />;
  }

  const commit = (patch: Partial<typeof form>) => {
    const next = { ...form, ...patch };
    setForm(next);
    // Persist only fields that map 1:1 to DB attrs.
    const dbPatch: Record<string, any> = {};
    if ("name" in patch) dbPatch.name = next.name;
    if ("status" in patch) dbPatch.status = next.status;
    if ("rating" in patch) dbPatch.rating = next.rating;
    if ("phone" in patch) dbPatch.phone = next.phone || undefined;
    if ("email" in patch) dbPatch.email = next.email;
    if ("linkedin" in patch) dbPatch.linkedin = next.linkedin || undefined;
    if ("github" in patch) dbPatch.github = next.github || undefined;
    if ("note" in patch) dbPatch.note = next.note || undefined;
    if (Object.keys(dbPatch).length && hasEditAccess) {
      db.transact(db.tx.candidates[candidate.id].update(dbPatch));
    }
  };

  const callHref = candidate.phone ? `tel:${candidate.phone}` : `mailto:${candidate.email}`;
  const callLabel = candidate.phone ? "Call Candidate" : "Email Candidate";

  return (
    <DrawerShell open={open} onClose={onClose}>
      <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header: close + prev/next */}
        <div className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-300/80 shadow-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
          <div className="flex items-center gap-1">
            <KeyboardShortcut
              disabled={!prev}
              onClick={() => prev && onSelect(prev.id)}
              aria-label="Previous candidate"
            >
              <ChevronLeftIcon />
            </KeyboardShortcut>
            <KeyboardShortcut
              disabled={!next}
              onClick={() => next && onSelect(next.id)}
              aria-label="Next candidate"
            >
              <ChevronRightIcon />
            </KeyboardShortcut>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
          <div className="flex flex-col gap-2.5">
            <Row label="Name">
              <InputField
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                onCommit={(v) => commit({ name: v })}
                disabled={!hasEditAccess}
                placeholder="Name"
              />
            </Row>

            <Row label="Applied for">
              <Dropdown
                renderValue={() => (
                  <span className="text-[13px] text-gray-500 truncate">
                    {candidate.position || "—"}
                  </span>
                )}
                items={positions.map((p) => ({ key: p, label: p, value: p }))}
                onSelect={(pos) => {
                  // Position is a relationship, not a string column — leave the in-memory value updated,
                  // but persisting a position change requires position ids, which we don't have here.
                  setForm((f) => ({ ...f, position: pos }));
                }}
              />
            </Row>

            <Row label="Date">
              <InputShell>
                <CalendarIcon
                  className={
                    candidate.activityLevel === "hot"
                      ? "text-status-first-call"
                      : "text-gray-400"
                  }
                />
                <span
                  className={`text-[13px] ${
                    candidate.activityLevel === "hot"
                      ? "text-status-first-call font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {candidate.dateAdded}
                </span>
              </InputShell>
            </Row>

            <Row label="Rating">
              <div
                className={`
                  flex items-center h-8 rounded-lg border border-gray-300/80
                  bg-status-reviewed-bg/60 px-2
                `}
              >
                <StarRating
                  rating={form.rating}
                  size="sm"
                  onChange={
                    hasEditAccess
                      ? (rating) => commit({ rating })
                      : undefined
                  }
                />
              </div>
            </Row>

            <Row label="Status">
              <Dropdown
                renderValue={() => (
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full ${statusDotClass[form.status]}`}
                    />
                    <span className="text-[13px] text-gray-700 truncate">
                      {form.status}
                    </span>
                  </span>
                )}
                items={ALL_STATUSES.map((s) => ({
                  key: s,
                  value: s,
                  label: (
                    <>
                      <span className={`w-2 h-2 rounded-full ${statusDotClass[s]}`} />
                      <span className="text-[13px] text-gray-700">{s}</span>
                    </>
                  ),
                }))}
                onSelect={(v) => commit({ status: v as CandidateStatus })}
              />
            </Row>

            <Row label="Phone">
              <InputField
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                onCommit={(v) => commit({ phone: v })}
                disabled={!hasEditAccess}
                placeholder="+48 000 000 000"
                leading={<PhoneIcon className="text-gray-400" />}
              />
            </Row>

            <Row label="Email">
              <InputField
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                onCommit={(v) => commit({ email: v })}
                disabled={!hasEditAccess}
                placeholder="name@email.com"
                leading={<MailIcon className="text-gray-400" />}
              />
            </Row>

            <Row label="LinkedIn">
              <InputField
                value={form.linkedin}
                onChange={(v) => setForm((f) => ({ ...f, linkedin: v }))}
                onCommit={(v) => commit({ linkedin: v })}
                disabled={!hasEditAccess}
                placeholder="linkedin.com/in/…"
                leading={<LinkedInSquareIcon />}
              />
            </Row>

            <Row label="Github">
              <InputField
                value={form.github}
                onChange={(v) => setForm((f) => ({ ...f, github: v }))}
                onCommit={(v) => commit({ github: v })}
                disabled={!hasEditAccess}
                placeholder="github.com/…"
                leading={<GitHubSquareIcon />}
              />
            </Row>

            {/* Attachments */}
            <div className="flex flex-col gap-1.5 mt-4">
              <div className="text-[13px] leading-[1.7] text-gray-900">
                Attachments
              </div>
              {candidate.resume && (
                <a
                  href={candidate.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 h-8 rounded-lg bg-white border border-gray-300/80 px-2 hover:bg-gray-50 transition-colors"
                >
                  <FileIcon className="text-gray-500" />
                  <span className="text-[13px] text-gray-700 truncate">resume.pdf</span>
                </a>
              )}
              {hasEditAccess && (
                <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-gray-50 border border-gray-300/80 border-dashed py-5 text-center">
                  <UploadIcon className="text-gray-400" />
                  <div className="text-[12px] text-gray-500 leading-tight">
                    Drag files here
                    <br />
                    or click to upload
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="text-[13px] leading-[1.7] text-gray-900">Note</div>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                onBlur={() => commit({ note: form.note })}
                disabled={!hasEditAccess}
                placeholder="Add note…"
                rows={3}
                className="
                  w-full rounded-lg bg-white border border-gray-300/80
                  px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-gray-900/10
                  resize-none disabled:bg-gray-50 disabled:text-gray-500
                "
              />
            </div>

            {/* Comments */}
            {currentUserId && (
              <CommentSection
                comments={candidate.comments ?? []}
                candidateId={candidate.id}
                currentUserId={currentUserId}
                hasCommentAccess={hasCommentAccess}
                hasEditAccess={hasEditAccess}
              />
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <a
            href={callHref}
            className="
              flex items-center justify-center h-11 rounded-lg
              bg-gray-900 text-white text-[14px] font-medium
              hover:bg-gray-800 transition-colors shadow-sm
            "
          >
            {callLabel}
          </a>
        </div>
      </div>
    </DrawerShell>
  );
}

/* ---------- Shell: overlay + slide animation ---------- */

function DrawerShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          absolute inset-0 bg-gray-900/20 backdrop-blur-[1px]
          transition-opacity duration-200
          ${open ? "opacity-100" : "opacity-0"}
        `}
      />
      {/* Panel */}
      <div
        className={`
          absolute top-0 right-0 h-full w-[402px] max-w-full p-2
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Controlled input with leading icon ---------- */

function InputField({
  value,
  onChange,
  onCommit,
  placeholder,
  leading,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: (v: string) => void;
  placeholder?: string;
  leading?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center h-8 rounded-lg bg-white border border-gray-300/80
        pl-2 pr-2 gap-2 overflow-hidden
        ${disabled ? "opacity-70" : "focus-within:ring-2 focus-within:ring-gray-900/10"}
      `}
    >
      {leading}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onCommit(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        className="
          flex-1 min-w-0 bg-transparent text-[13px] text-gray-900
          placeholder:text-gray-400 focus:outline-none disabled:text-gray-500
        "
      />
    </div>
  );
}

/* ---------- Little helper for the shortcut keys at the top-right ---------- */

function KeyboardShortcut({
  children,
  disabled,
  onClick,
  ...props
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center w-8 h-8 rounded-lg
        bg-white border border-gray-300/80 shadow-sm text-gray-900
        hover:bg-gray-50 transition-colors cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------- Form <-> Candidate mapping ---------- */

type Form = {
  name: string;
  position: string;
  status: CandidateStatus;
  rating: number;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  note: string;
};

function fromCandidate(c: Candidate | null): Form {
  return {
    name: c?.name ?? "",
    position: c?.position ?? "",
    status: (c?.status as CandidateStatus) ?? "New",
    rating: c?.rating ?? 0,
    phone: c?.phone ?? "",
    email: c?.email ?? "",
    linkedin: c?.linkedin ?? "",
    github: c?.github ?? "",
    note: c?.note ?? "",
  };
}
