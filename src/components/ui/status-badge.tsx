export type CandidateStatus =
  | "Processing"
  | "New"
  | "Reviewed"
  | "1st Call"
  | "2nd Call"
  | "Deal"
  | "Hired"
  | "Rejected";

const statusStyles: Record<CandidateStatus, { dot: string; bg: string; text: string }> = {
  Processing: { dot: "bg-status-processing", bg: "bg-status-processing-bg", text: "text-status-processing" },
  New: { dot: "bg-status-new", bg: "bg-status-new-bg", text: "text-status-new" },
  Reviewed: { dot: "bg-status-reviewed", bg: "bg-status-reviewed-bg", text: "text-status-reviewed" },
  "1st Call": { dot: "bg-status-first-call", bg: "bg-status-first-call-bg", text: "text-status-first-call" },
  "2nd Call": { dot: "bg-status-second-call", bg: "bg-status-second-call-bg", text: "text-status-second-call" },
  Deal: { dot: "bg-status-deal", bg: "bg-status-deal-bg", text: "text-status-deal" },
  Hired: { dot: "bg-status-hired", bg: "bg-status-hired-bg", text: "text-status-hired" },
  Rejected: { dot: "bg-status-rejected", bg: "bg-status-rejected-bg", text: "text-status-rejected" },
};

export type StatusBadgeProps = {
  status: CandidateStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${styles.bg} ${styles.text}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
}
