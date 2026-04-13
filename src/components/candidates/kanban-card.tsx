import { forwardRef, useState, type ReactNode } from "react";
import { db } from "@/lib/db";
import { StarRating } from "../ui/star-rating";
import { NoteIcon, GoogleMeetIcon } from "../ui/icons";
import { CommentSection } from "./comment-section";
import { type Candidate } from "./types";

/* ---------- Icons matching Pencil "CTA" pill design (32×32, white, shadow) ---------- */

function GitHubGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="#1B1B1B">
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.43 7.43 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

function FileGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#8E8E8F"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 1.5H4A1.5 1.5 0 002.5 3v10A1.5 1.5 0 004 14.5h8a1.5 1.5 0 001.5-1.5V5.5L9.5 1.5z" />
      <path d="M9.5 1.5V5.5h4" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#8E8E8F"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" />
      <path d="M7 12.5h2" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#8E8E8F"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="M2 4l6 4 6-4" />
    </svg>
  );
}

function PlusCircleGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#8E8E8F"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5.5v5M5.5 8h5" />
    </svg>
  );
}

/** 32×32 white pill button matching Pencil frame "CTA" (WQnuQ/e8XOu/VbE7y/mI3AX). */
function CtaPill({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center w-8 h-8 rounded-lg bg-white
        border border-gray-300/80 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer
      "
    >
      {children}
    </button>
  );
}

/**
 * Activity indicator bars — 5 uniform 2×11 bars with gap-1.
 * Bars beyond the activity level are shown at 20% opacity of the level color.
 */
function ActivityBars({ level }: { level?: Candidate["activityLevel"] }) {
  const palette: Record<NonNullable<Candidate["activityLevel"]>, string> = {
    hot: "#D13938",
    warm: "#CF7727",
    recent: "#339E68",
    normal: "#339E68",
    cold: "#CFCFCF",
  };
  const bars: Record<NonNullable<Candidate["activityLevel"]>, number> = {
    hot: 5,
    warm: 4,
    recent: 1,
    normal: 2,
    cold: 1,
  };
  const l = level || "normal";
  const color = palette[l];
  const filled = bars[l];

  return (
    <div className="flex items-end gap-[1px] h-[11px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-[2px] h-[11px] rounded-[1px]"
          style={{
            backgroundColor: color,
            opacity: i <= filled ? 1 : 0.2,
          }}
        />
      ))}
    </div>
  );
}

export type KanbanCardProps = {
  candidate: Candidate;
  isDragging?: boolean;
  isProcessing?: boolean;
  hasEditAccess?: boolean;
  hasCommentAccess?: boolean;
  currentUserId?: string;
};

export const KanbanCard = forwardRef<
  HTMLDivElement,
  KanbanCardProps & React.HTMLAttributes<HTMLDivElement>
>(function KanbanCard(
  {
    candidate,
    isDragging,
    isProcessing,
    hasEditAccess = true,
    hasCommentAccess = true,
    currentUserId,
    style,
    ...props
  },
  ref,
) {
  const [showComments, setShowComments] = useState(false);
  const hasCalendar = candidate.hasCalendarEvent;
  const commentCount = candidate.comments?.length ?? 0;

  if (isProcessing) {
    return (
      <div className="bg-white rounded-xl border border-status-processing/30 p-3 mb-2.5 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="animate-spin h-4 w-4 text-status-processing"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-[13px] font-medium text-status-processing">
            Analyzing CV...
          </span>
        </div>
        <div className="text-[16px] font-medium text-gray-900 mb-1">
          {candidate.name}
        </div>
        <div className="text-[13px] text-gray-500">{candidate.email}</div>
      </div>
    );
  }

  // Profile icons (left, grouped on a gray pill background) — github + linkedin + resume
  const profileIcons: { key: string; node: ReactNode }[] = [];
  if (candidate.github) profileIcons.push({ key: "gh", node: <GitHubGlyph /> });
  if (candidate.linkedin)
    profileIcons.push({ key: "li", node: <LinkedInGlyph /> });
  if (candidate.resume) profileIcons.push({ key: "cv", node: <FileGlyph /> });

  // Action icons (right, separated) — phone + mail
  const actionIcons: { key: string; node: ReactNode }[] = [];
  if (candidate.phone)
    actionIcons.push({ key: "ph", node: <PhoneGlyph /> });
  actionIcons.push({ key: "ml", node: <MailGlyph /> });

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transform: style?.transform
          ? `${style.transform}${isDragging ? " rotate(2deg)" : ""}`
          : isDragging
            ? "rotate(2deg)"
            : undefined,
      }}
      className={`
        bg-white rounded-xl border border-gray-300/80 p-3 mb-2.5 cursor-grab
        flex flex-col gap-2
        ${isDragging ? "shadow-sm opacity-95" : "shadow-sm hover:shadow-md transition-shadow"}
      `}
      {...props}
    >
      {/* Position */}
      <div className="text-[13px] leading-[1.7] text-gray-500">
        {candidate.position}
      </div>

      {/* Name */}
      <div className="text-[16px] font-medium text-gray-900 -mt-1">
        {candidate.name}
      </div>

      {/* Social icons row */}
      <div className="flex items-center justify-between py-1">
        {profileIcons.length > 0 ? (
          <div className="flex items-center gap-0.5 p-0.5 rounded-[10px] bg-gray-100">
            {profileIcons.map((i) => (
              <CtaPill key={i.key}>{i.node}</CtaPill>
            ))}
          </div>
        ) : (
          <div />
        )}
        {actionIcons.length > 0 && (
          <div className="flex items-center gap-1">
            {actionIcons.map((i) => (
              <CtaPill key={i.key}>{i.node}</CtaPill>
            ))}
          </div>
        )}
      </div>

      {/* Activity + Date */}
      <div className="flex items-center gap-1.5">
        <ActivityBars level={candidate.activityLevel} />
        <span
          className={`text-[13px] ${
            candidate.activityLevel === "hot"
              ? "text-status-first-call font-medium"
              : "text-gray-500"
          }`}
        >
          {candidate.dateAdded}
        </span>
      </div>

      {/* Calendar / Join call */}
      {hasCalendar &&
        (candidate.status === "2nd Call" || candidate.status === "1st Call") && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-600 border border-gray-200 rounded-md px-2 py-0.5">
              Join call
            </span>
            <GoogleMeetIcon />
          </div>
        )}

      {hasCalendar && (
        <div className="text-[12px] text-gray-500">Today, 8:30 pm CEST</div>
      )}

      {/* Note */}
      {candidate.note && (
        <div className="rounded-lg bg-gray-100 px-2 py-1.5">
          <p className="text-[13px] text-gray-900 leading-[1.4] line-clamp-3">
            {candidate.note}
          </p>
        </div>
      )}

      {/* Stars + plus action */}
      <div className="flex items-stretch gap-1">
        <div className="flex-1 flex items-center">
          <StarRating
            rating={candidate.rating}
            size="sm"
            onChange={
              hasEditAccess
                ? (rating) => {
                    db.transact(
                      db.tx.candidates[candidate.id].update({ rating }),
                    );
                  }
                : undefined
            }
          />
        </div>
        <div className="flex items-center gap-1">
          {commentCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className={`flex items-center gap-0.5 w-8 h-8 justify-center rounded-lg hover:bg-gray-100 cursor-pointer ${
                showComments ? "text-blue-500" : "text-gray-500"
              }`}
              aria-label="Comments"
            >
              <NoteIcon />
              <span className="text-[11px]">{commentCount}</span>
            </button>
          )}
          {hasEditAccess && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (commentCount === 0 && hasCommentAccess) {
                  setShowComments(!showComments);
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-500"
              aria-label="Add note"
            >
              <PlusCircleGlyph />
            </button>
          )}
        </div>
      </div>

      {/* Comments section */}
      {showComments && currentUserId && (
        <CommentSection
          comments={candidate.comments ?? []}
          candidateId={candidate.id}
          currentUserId={currentUserId}
          hasCommentAccess={hasCommentAccess}
          hasEditAccess={hasEditAccess}
        />
      )}
    </div>
  );
});
