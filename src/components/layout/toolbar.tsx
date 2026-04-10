import { ViewToggle } from "../ui/view-toggle";
import { FilterChip } from "../ui/filter-chip";
import { Button } from "../ui/button";
import { FilterIcon, ChevronDownIcon, AddIcon } from "../ui/icons";
import { useState } from "react";

export type ToolbarProps = {
  view?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;
  callTodayCount?: number;
  updatedCount?: number;
};

export function Toolbar({
  view = "list",
  onViewChange,
  callTodayCount = 4,
  updatedCount = 0,
}: ToolbarProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (name: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200">
      <ViewToggle view={view} onChange={onViewChange} />

      <Button
        variant="outline"
        size="sm"
        icon={<FilterIcon />}
      >
        Filters
      </Button>

      {/* Position dropdown */}
      <Button variant="outline" size="sm">
        Position
        <span className="text-gray-500 ml-0.5">All</span>
        <ChevronDownIcon className="text-gray-400" />
      </Button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <FilterChip
        active={activeFilters.has("new")}
        onClick={() => toggleFilter("new")}
      >
        New
      </FilterChip>

      <FilterChip
        active={activeFilters.has("callToday")}
        onClick={() => toggleFilter("callToday")}
        count={callTodayCount}
      >
        Call today
      </FilterChip>

      <FilterChip
        active={activeFilters.has("stars")}
        onClick={() => toggleFilter("stars")}
        icon={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#D9AC00" stroke="#D9AC00" strokeWidth="0.5">
            <path d="M8 1.5L9.79 5.12L13.76 5.7L10.88 8.5L11.58 12.45L8 10.56L4.42 12.45L5.12 8.5L2.24 5.7L6.21 5.12L8 1.5Z" />
          </svg>
        }
      >
        Above 4 stars
      </FilterChip>

      {/* Grid-only: Show dropdown */}
      {view === "grid" && (
        <Button variant="outline" size="sm">
          Show
          <span className="text-gray-500 ml-0.5">All</span>
          <ChevronDownIcon className="text-gray-400" />
        </Button>
      )}

      <FilterChip
        active={activeFilters.has("updated")}
        onClick={() => toggleFilter("updated")}
        count={updatedCount}
        showCount
      >
        Updated
      </FilterChip>

      {/* Spacer to push Add Status right */}
      {view === "grid" && (
        <>
          <div className="flex-1" />
          <Button variant="outline" size="sm" icon={<AddIcon className="text-gray-500" />}>
            Add Status
          </Button>
        </>
      )}
    </div>
  );
}
