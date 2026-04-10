import { useState } from "react";
import { TopNav } from "../layout/top-nav";
import { StatsBar } from "../layout/stats-bar";
import { Toolbar } from "../layout/toolbar";
import { CandidateTable } from "../candidates/candidate-table";
import { KanbanBoard } from "../candidates/kanban-board";
import { Button } from "../ui/button";
import { AddPersonIcon, AddIcon, HelpIcon } from "../ui/icons";
import { type Candidate } from "../candidates/types";

export type CurrentRecruitmentsProps = {
  candidates: Candidate[];
  kanbanCandidates?: Candidate[];
};

export function CurrentRecruitments({ candidates, kanbanCandidates }: CurrentRecruitmentsProps) {
  const [view, setView] = useState<"grid" | "list">("list");

  return (
    <div className="min-h-screen bg-gray-800">
      <TopNav />
      <div className="m-2 bg-gray-50 rounded-2xl min-h-[calc(100vh-72px)]">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Current Recruitments
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={<AddPersonIcon />}>
              Add Candidate
            </Button>
            <Button variant="secondary" icon={<AddIcon />}>
              Add position
            </Button>
            <Button variant="primary" icon={<HelpIcon className="text-white" />}>
              Need help with candidates Screening?{" "}
              <span className="font-semibold underline">Reach out</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Toolbar */}
        <Toolbar view={view} onViewChange={setView} />

        {/* Content */}
        {view === "list" ? (
          <CandidateTable candidates={candidates} />
        ) : (
          <KanbanBoard candidates={kanbanCandidates ?? candidates} />
        )}
      </div>
    </div>
  );
}
