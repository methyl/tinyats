import { forwardRef, useState } from "react";
import { db } from "@/lib/db";
import { StarRating } from "../ui/star-rating";
import { NoteIcon, MailIcon, PhoneIcon, GoogleMeetIcon } from "../ui/icons";
import { CommentSection } from "./comment-section";
import { type Candidate } from "./types";

function LinkedInSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="0.5" y="0.5" width="23" height="23" rx="5" stroke="#E7E9E7" fill="white" />
      <path d="M7.5 16.5H5.5V9.5h2v7zM6.5 8.6a1.1 1.1 0 110-2.2 1.1 1.1 0 010 2.2zm11 7.9h-2v-3.3c0-.8 0-1.8-1.1-1.8s-1.2.8-1.2 1.6v3.5h-2V9.5h1.9v1h.03c.27-.5.93-1.1 1.9-1.1 2 0 2.4 1.3 2.4 3.1v4z" fill="#0A66C2" />
    </svg>
  );
}

function GitHubSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="0.5" y="0.5" width="23" height="23" rx="5" stroke="#E7E9E7" fill="white" />
      <path d="M12 4.5a7.5 7.5 0 00-2.37 14.62c.38.07.51-.16.51-.36v-1.27c-2.09.46-2.53-1-2.53-1a2 2 0 00-.83-1.1c-.68-.47.05-.46.05-.46a1.56 1.56 0 011.14.77 1.58 1.58 0 002.16.62 1.6 1.6 0 01.47-1c-1.67-.19-3.42-.84-3.42-3.7a2.9 2.9 0 01.77-2 2.7 2.7 0 01.07-1.98s.63-.2 2.06.77a7.1 7.1 0 013.76 0c1.43-.97 2.06-.77 2.06-.77a2.7 2.7 0 01.07 1.98 2.9 2.9 0 01.77 2c0 2.87-1.75 3.5-3.42 3.7a1.78 1.78 0 01.51 1.38v2.06c0 .2.13.43.51.36A7.5 7.5 0 0012 4.5z" fill="#24292F" />
    </svg>
  );
}

function ResumeSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="0.5" y="0.5" width="23" height="23" rx="5" stroke="#E7E9E7" fill="white" />
      <path d="M14 6H9a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 009 18h6a1.5 1.5 0 001.5-1.5V9.5L14 6z" stroke="#8E8E8F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6v3.5h2.5" stroke="#8E8E8F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="0.5" y="0.5" width="23" height="23" rx="5" stroke="#E7E9E7" fill="white" />
      <rect x="8" y="5.5" width="8" height="13" rx="2" stroke="#8E8E8F" strokeWidth="1.2" />
      <path d="M10.5 16h3" stroke="#8E8E8F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function MailSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="0.5" y="0.5" width="23" height="23" rx="5" stroke="#E7E9E7" fill="white" />
      <rect x="5" y="7.5" width="14" height="9" rx="2" stroke="#8E8E8F" strokeWidth="1.2" />
      <path d="M5.5 8.5l6.5 4 6.5-4" stroke="#8E8E8F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8E8E8F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 2.5V4a1 1 0 011-1z" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8E8E8F" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5.5v5M5.5 8h5" />
    </svg>
  );
}

function ActivityIndicatorSmall({ level }: { level?: Candidate["activityLevel"] }) {
  const colors: Record<string, string> = {
    hot: "#D13938",
    warm: "#CF7727",
    recent: "#339E68",
    normal: "#339E68",
    cold: "#CFCFCF",
  };
  const bars: Record<string, number> = {
    hot: 5, warm: 4, recent: 3, normal: 2, cold: 1,
  };
  const l = level || "normal";
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-sm"
          style={{
            height: `${3 + i * 2}px`,
            backgroundColor: i <= bars[l] ? colors[l] : "#E7E9E7",
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

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps & React.HTMLAttributes<HTMLDivElement>>(
  function KanbanCard({ candidate, isDragging, isProcessing, hasEditAccess = true, hasCommentAccess = true, currentUserId, style, ...props }, ref) {
    const [showComments, setShowComments] = useState(false);
    const hasCalendar = candidate.hasCalendarEvent;
    const commentCount = candidate.comments?.length ?? 0;

    if (isProcessing) {
      return (
        <div className="bg-white rounded-xl border border-status-processing/30 p-4 mb-2.5 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <svg className="animate-spin h-4 w-4 text-status-processing" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[13px] font-medium text-status-processing">Analyzing CV...</span>
          </div>
          <div className="text-[15px] font-medium text-gray-900 mb-1">{candidate.name}</div>
          <div className="text-[13px] text-gray-500">{candidate.email}</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        style={{
          ...style,
          transform: style?.transform
            ? `${style.transform}${isDragging ? " rotate(2deg)" : ""}`
            : isDragging ? "rotate(2deg)" : undefined,
        }}
        className={`
          bg-white rounded-xl border border-gray-200 p-4 mb-2.5 cursor-grab
          ${isDragging ? "shadow-sm opacity-95" : "shadow-xs hover:shadow-sm transition-shadow"}
        `}
        {...props}
      >
        {/* Position */}
        <div className="text-[13px] text-gray-500 mb-0.5">{candidate.position}</div>

        {/* Name */}
        <div className="text-[15px] font-medium text-gray-900 mb-3">{candidate.name}</div>

        {/* Social icons row */}
        <div className="flex items-center gap-1.5 mb-3">
          {candidate.github && <GitHubSmall />}
          {candidate.linkedin && <LinkedInSmall />}
          {candidate.resume && <ResumeSmall />}
          {candidate.phone && <PhoneSmall />}
          <MailSmall />
        </div>

        {/* Activity + Date */}
        <div className="flex items-center gap-2 mb-2">
          <ActivityIndicatorSmall level={candidate.activityLevel} />
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
        {hasCalendar && (
          <div className="flex items-center gap-2 mb-2">
            {candidate.status === "2nd Call" || candidate.status === "1st Call" ? (
              <>
                <span className="text-[13px] text-gray-600 border border-gray-200 rounded-md px-2 py-0.5">
                  Join call
                </span>
                <GoogleMeetIcon />
              </>
            ) : null}
          </div>
        )}

        {hasCalendar && (
          <div className="text-[12px] text-gray-500 mb-2">Today, 8:30 pm CEST</div>
        )}

        {/* Add link */}
        {!candidate.linkedin && !candidate.phone && (
          <button className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700 mb-2 cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5 7L7 5M4.5 5.5l-1 1a2 2 0 002.83 2.83l1-1M7.5 6.5l1-1A2 2 0 005.67 2.67l-1 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add link
          </button>
        )}

        {/* Note */}
        {candidate.note && (
          <p className="text-[13px] text-gray-500 leading-[1.4] mb-3 line-clamp-3">
            {candidate.note}
          </p>
        )}

        {/* Stars + actions */}
        <div className="flex items-center justify-between pt-1">
          <StarRating
            rating={candidate.rating}
            size="sm"
            onChange={hasEditAccess ? (rating) => {
              db.transact(db.tx.candidates[candidate.id].update({ rating }));
            } : undefined}
          />
          <div className="flex items-center gap-1.5">
            {(hasCommentAccess || commentCount > 0) && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                className={`p-0.5 rounded hover:bg-gray-100 cursor-pointer flex items-center gap-0.5 ${showComments ? "text-blue-500" : "text-gray-500"}`}
              >
                <CommentIcon />
                {commentCount > 0 && (
                  <span className="text-[11px]">{commentCount}</span>
                )}
              </button>
            )}
            {hasEditAccess && (
              <button className="p-0.5 rounded hover:bg-gray-100 cursor-pointer text-gray-500">
                <PlusCircleIcon />
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
  }
);
