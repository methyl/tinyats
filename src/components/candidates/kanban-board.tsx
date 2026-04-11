import { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { db } from "@/lib/db";
import { KanbanCard } from "./kanban-card";
import { type CandidateStatus } from "../ui/status-badge";
import { type Candidate } from "./types";

const ALL_STATUSES: CandidateStatus[] = [
  "New",
  "Reviewed",
  "1st Call",
  "2nd Call",
  "Deal",
  "Hired",
  "Rejected",
];

const statusDotColor: Record<CandidateStatus, string> = {
  New: "bg-status-new",
  Reviewed: "bg-status-reviewed",
  "1st Call": "bg-status-first-call",
  "2nd Call": "bg-status-second-call",
  Deal: "bg-status-deal",
  Hired: "bg-status-hired",
  Rejected: "bg-status-rejected",
};

export type KanbanBoardProps = {
  candidates: Candidate[];
};

type ColumnMap = Record<CandidateStatus, Candidate[]>;

function groupByStatus(candidates: Candidate[]): ColumnMap {
  const map: ColumnMap = {
    New: [],
    Reviewed: [],
    "1st Call": [],
    "2nd Call": [],
    Deal: [],
    Hired: [],
    Rejected: [],
  };
  for (const c of candidates) {
    map[c.status].push(c);
  }
  // Sort each column by sortOrder
  for (const status of ALL_STATUSES) {
    map[status].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return map;
}

// Compute a sortOrder value between two neighbors
function orderBetween(before: number | undefined, after: number | undefined): number {
  if (before == null && after == null) return 1000;
  if (before == null) return after! - 1000;
  if (after == null) return before + 1000;
  return (before + after) / 2;
}

export function KanbanBoard({ candidates }: KanbanBoardProps) {
  const columns = useMemo(() => groupByStatus(candidates), [candidates]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const srcCol = source.droppableId as CandidateStatus;
    const destCol = destination.droppableId as CandidateStatus;

    if (srcCol === destCol && source.index === destination.index) return;

    // Build the destination column's ordered list (excluding the dragged card)
    const destItems = columns[destCol].filter((c) => c.id !== draggableId);

    const destIndex = srcCol === destCol
      ? // Same column: adjust index since we removed the item
        destination.index
      : destination.index;

    const before = destItems[destIndex - 1]?.sortOrder;
    const after = destItems[destIndex]?.sortOrder;
    const newOrder = orderBetween(before, after);

    const update: Record<string, any> = { sortOrder: newOrder };
    if (srcCol !== destCol) {
      update.status = destCol;
    }

    db.transact(db.tx.candidates[draggableId].update(update));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 px-6 py-4 overflow-x-auto">
        {ALL_STATUSES.map((status) => (
          <div key={status} className="flex flex-col min-w-[220px] w-[220px]">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 pb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor[status]}`} />
              <span className="text-sm font-medium text-gray-900">{status}</span>
            </div>

            {/* Droppable zone */}
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    flex flex-col flex-1 min-h-[100px] rounded-xl p-0.5
                    transition-colors
                    ${snapshot.isDraggingOver ? "bg-gray-100" : ""}
                  `}
                >
                  {columns[status].map((candidate, index) => (
                    <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                      {(provided, snapshot) => (
                        <KanbanCard
                          ref={provided.innerRef}
                          candidate={candidate}
                          isDragging={snapshot.isDragging && !snapshot.isDropAnimating}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={provided.draggableProps.style}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
