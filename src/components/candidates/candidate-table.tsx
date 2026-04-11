import { useState } from "react";
import { db } from "@/lib/db";
import { Checkbox } from "../ui/checkbox";
import { StatusBadge } from "../ui/status-badge";
import { StarRating } from "../ui/star-rating";
import { SocialLinks } from "../ui/social-links";
import { SortIcon, PhoneIcon, MailIcon, NoteIcon, MoreIcon, CalendarIcon, GoogleMeetIcon } from "../ui/icons";
import { type Candidate } from "./types";

export type CandidateTableProps = {
  candidates: Candidate[];
};

function ActivityIndicator({ level }: { level?: Candidate["activityLevel"] }) {
  const colors = {
    hot: "bg-status-first-call",
    warm: "bg-status-reviewed",
    recent: "bg-status-second-call",
    normal: "bg-status-second-call",
    cold: "bg-gray-300",
  };
  const bars = {
    hot: 5,
    warm: 4,
    recent: 3,
    normal: 2,
    cold: 1,
  };
  const l = level || "normal";
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm ${i <= bars[l] ? colors[l] : "bg-gray-200"}`}
          style={{ height: `${4 + i * 2.5}px` }}
        />
      ))}
    </div>
  );
}

function ColumnHeader({
  children,
  sortable = true,
}: {
  children: React.ReactNode;
  sortable?: boolean;
}) {
  return (
    <th className="text-left text-[13px] font-medium text-gray-500 px-4 py-3 whitespace-nowrap">
      <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-gray-700">
        {children}
        {sortable && <SortIcon className="text-gray-400" />}
      </span>
    </th>
  );
}

function PositionTag({ position }: { position: string }) {
  return (
    <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-sm text-gray-600">
      {position}
    </span>
  );
}

export function CandidateTable({ candidates }: CandidateTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = candidates.length > 0 && selected.size === candidates.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidates.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="w-14 px-5 py-3">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
              />
            </th>
            <ColumnHeader>Name</ColumnHeader>
            <ColumnHeader>Position</ColumnHeader>
            <ColumnHeader>Status</ColumnHeader>
            <ColumnHeader>Rating</ColumnHeader>
            <ColumnHeader sortable={false}>Links</ColumnHeader>
            <ColumnHeader sortable={false}>Phone</ColumnHeader>
            <ColumnHeader sortable={false}>Email</ColumnHeader>
            <ColumnHeader sortable={false}>Note</ColumnHeader>
            <ColumnHeader>Date added</ColumnHeader>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              className={`
                border-b border-gray-200 hover:bg-gray-50 transition-colors
                ${selected.has(candidate.id) ? "bg-blue-50/50" : ""}
              `}
            >
              {/* Checkbox */}
              <td className="w-14 px-5 py-5">
                <Checkbox
                  checked={selected.has(candidate.id)}
                  onChange={() => toggleOne(candidate.id)}
                />
              </td>

              {/* Name */}
              <td className="px-4 py-5 whitespace-nowrap">
                <span className="text-[15px] font-medium text-gray-900">
                  {candidate.name}
                </span>
              </td>

              {/* Position */}
              <td className="px-4 py-5 whitespace-nowrap">
                <PositionTag position={candidate.position} />
              </td>

              {/* Status */}
              <td className="px-4 py-5">
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={candidate.status} />
                  {candidate.hasCalendarEvent && (
                    <span className="text-gray-400">
                      <CalendarIcon />
                    </span>
                  )}
                  {candidate.status === "2nd Call" && candidate.hasCalendarEvent && (
                    <GoogleMeetIcon />
                  )}
                </div>
              </td>

              {/* Rating */}
              <td className="px-4 py-5">
                <StarRating
                  rating={candidate.rating}
                  size="md"
                  onChange={(rating) => {
                    db.transact(db.tx.candidates[candidate.id].update({ rating }));
                  }}
                />
              </td>

              {/* Links */}
              <td className="px-4 py-5">
                <SocialLinks
                  linkedin={candidate.linkedin}
                  github={candidate.github}
                  resume={candidate.resume}
                />
              </td>

              {/* Phone */}
              <td className="px-4 py-5">
                {candidate.phone ? (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <PhoneIcon className="text-gray-400 flex-shrink-0" />
                    {candidate.phone}
                  </span>
                ) : (
                  <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 cursor-pointer">
                    <PhoneIcon className="text-gray-400" />
                    Add
                  </button>
                )}
              </td>

              {/* Email */}
              <td className="px-4 py-5">
                <span className="flex items-center gap-1.5 text-sm text-gray-600 max-w-[180px] truncate">
                  <MailIcon className="text-gray-400 flex-shrink-0" />
                  {candidate.email}
                </span>
              </td>

              {/* Note */}
              <td className="px-4 py-5 max-w-[200px]">
                {candidate.note ? (
                  <span className="text-sm text-gray-600 truncate block">
                    {candidate.note}
                  </span>
                ) : (
                  <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <NoteIcon />
                  </button>
                )}
              </td>

              {/* Date added */}
              <td className="px-4 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <ActivityIndicator level={candidate.activityLevel} />
                  <span
                    className={`text-sm ${
                      candidate.activityLevel === "hot"
                        ? "text-status-first-call font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {candidate.dateAdded}
                  </span>
                </div>
              </td>

              {/* Actions */}
              <td className="w-10 px-2 py-5">
                <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <MoreIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
