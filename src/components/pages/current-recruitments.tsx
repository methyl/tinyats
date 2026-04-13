import { useState } from "react";
import { db } from "@/lib/db";
import { useWorkspace, useWorkspaceQuery } from "@/lib/workspace-context";
import { toCandidate, type Candidate } from "../candidates/types";
import { TopNav } from "../layout/top-nav";
import { StatsBar } from "../layout/stats-bar";
import { Toolbar, defaultFilters, type ActiveFilters } from "../layout/toolbar";
import { CandidateTable } from "../candidates/candidate-table";
import { KanbanBoard } from "../candidates/kanban-board";
import { CandidateDrawer } from "../candidates/candidate-drawer";
import { CvDropZone } from "../candidates/cv-drop-zone";
import { Button } from "../ui/button";
import { AddPersonIcon, AddIcon, HelpIcon } from "../ui/icons";

function applyFilters(candidates: Candidate[], filters: ActiveFilters): Candidate[] {
  let result = candidates;

  if (filters.position) {
    result = result.filter((c) => c.position === filters.position);
  }
  if (filters.new) {
    result = result.filter((c) => c.status === "New");
  }
  if (filters.callToday) {
    result = result.filter((c) => c.hasCalendarEvent);
  }
  if (filters.stars) {
    result = result.filter((c) => c.rating >= 4);
  }

  return result;
}

export function CurrentRecruitments() {
  const [view, setView] = useState<"grid" | "list">("list");
  const [filters, setFilters] = useState<ActiveFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { hasEditAccess, hasCommentAccess } = useWorkspace();
  const { user } = db.useAuth();

  const { isLoading, error, data } = useWorkspaceQuery({
    candidates: { position: {}, comments: { author: {} } },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error.message}</div>
      </div>
    );
  }

  const allCandidates = ((data as any)?.candidates ?? []).map(toCandidate);
  const candidates = applyFilters(allCandidates, filters);

  const positions = [...new Set(allCandidates.map((c: Candidate) => c.position).filter(Boolean))].sort() as string[];
  const callTodayCount = allCandidates.filter((c: Candidate) => c.hasCalendarEvent).length;

  const content = (
    <div className="min-h-screen bg-gray-800">
      <TopNav />
      <div className="m-2 bg-gray-50 rounded-2xl min-h-[calc(100vh-72px)]">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Current Recruitments
          </h1>
          <div className="flex items-center gap-3">
            {hasEditAccess && (
              <>
                <Button variant="secondary" icon={<AddPersonIcon />}>
                  Add Candidate
                </Button>
                <Button variant="secondary" icon={<AddIcon />}>
                  Add position
                </Button>
              </>
            )}
            <Button variant="primary" icon={<HelpIcon className="text-white" />}>
              Need help with candidates Screening?{" "}
              <span className="font-semibold underline">Reach out</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Toolbar */}
        <Toolbar
          view={view}
          onViewChange={setView}
          filters={filters}
          onFiltersChange={setFilters}
          callTodayCount={callTodayCount}
          positions={positions}
        />

        {/* Content */}
        {view === "list" ? (
          <CandidateTable candidates={candidates} onSelect={setSelectedId} />
        ) : (
          <KanbanBoard candidates={candidates} onSelect={setSelectedId} />
        )}
      </div>

      {/* Candidate details drawer */}
      <CandidateDrawer
        candidate={candidates.find((c: Candidate) => c.id === selectedId) ?? null}
        candidates={candidates}
        onClose={() => setSelectedId(null)}
        onSelect={setSelectedId}
        positions={positions}
        hasEditAccess={hasEditAccess}
        hasCommentAccess={hasCommentAccess}
        currentUserId={user?.id}
      />
    </div>
  );

  return hasEditAccess ? <CvDropZone>{content}</CvDropZone> : content;
}
