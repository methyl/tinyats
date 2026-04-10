import { type CandidateStatus } from "../ui/status-badge";

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
};
