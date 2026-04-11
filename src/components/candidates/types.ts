import { type InstaQLEntity } from "@instantdb/react";
import { type AppSchema } from "@/instant.schema";
import { type CandidateStatus } from "../ui/status-badge";

export type DbCandidate = InstaQLEntity<AppSchema, "candidates">;
export type DbPosition = InstaQLEntity<AppSchema, "positions">;
export type DbCandidateWithPosition = InstaQLEntity<AppSchema, "candidates", { position: {} }>;

export type CandidateComment = {
  id: string;
  body: string;
  createdAt: number;
  author?: { id: string; email?: string };
};

// View-layer type matching the components' expectations
export type Candidate = {
  id: string;
  name: string;
  position: string;
  status: CandidateStatus;
  rating: number;
  linkedin?: string;
  github?: string;
  resume?: string;
  phone?: string;
  email: string;
  note?: string;
  dateAdded: string;
  hasCalendarEvent?: boolean;
  activityLevel?: "hot" | "warm" | "recent" | "normal" | "cold";
  sortOrder: number;
  comments?: CandidateComment[];
};

// Convert DB entity to view type
export function toCandidate(c: DbCandidateWithPosition & { comments?: any[] }): Candidate {
  const now = Date.now();
  const diff = now - c.dateAdded;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let dateStr: string;
  if (mins < 5) dateStr = "Just now";
  else if (mins < 60) dateStr = `${mins} min ago`;
  else if (hours < 24) dateStr = `${hours}h ago`;
  else if (days === 1) dateStr = "Yesterday";
  else if (days < 7) {
    dateStr = new Date(c.dateAdded).toLocaleDateString("en-US", { weekday: "long" });
  } else {
    dateStr = new Date(c.dateAdded).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(days > 365 ? { year: "numeric" } : {}),
    });
  }

  return {
    id: c.id,
    name: c.name,
    position: (c.position as any)?.name ?? "—",
    status: c.status as CandidateStatus,
    rating: c.rating,
    linkedin: c.linkedin ?? undefined,
    github: c.github ?? undefined,
    resume: c.resume ?? undefined,
    phone: c.phone ?? undefined,
    email: c.email,
    note: c.note ?? undefined,
    dateAdded: dateStr,
    hasCalendarEvent: c.hasCalendarEvent ?? false,
    activityLevel: (c.activityLevel as Candidate["activityLevel"]) ?? "normal",
    sortOrder: c.sortOrder,
    comments: (c.comments ?? []).map((comment: any) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: comment.author
        ? { id: comment.author.id, email: comment.author.email }
        : undefined,
    })),
  };
}
