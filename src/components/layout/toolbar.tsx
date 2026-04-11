import { ViewToggle } from "../ui/view-toggle";
import { FilterChip } from "../ui/filter-chip";
import { Button } from "../ui/button";
import { FilterIcon, ChevronDownIcon, AddIcon } from "../ui/icons";
import { useState, useRef, useEffect } from "react";

export type ActiveFilters = {
  new: boolean;
  callToday: boolean;
  stars: boolean;
  updated: boolean;
  position: string | null; // null = "All"
};

export const defaultFilters: ActiveFilters = {
  new: false,
  callToday: false,
  stars: false,
  updated: false,
  position: null,
};

export type ToolbarProps = {
  view?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  callTodayCount?: number;
  updatedCount?: number;
  positions?: string[];
};

function PositionDropdown({
  positions,
  selected,
  onSelect,
}: {
  positions: string[];
  selected: string | null;
  onSelect: (pos: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
        Position
        <span className="text-gray-500 ml-0.5">{selected ?? "All"}</span>
        <ChevronDownIcon className="text-gray-400" />
      </Button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-20 min-w-[160px] py-1">
          <button
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer ${
              selected === null ? "font-medium text-gray-900" : "text-gray-600"
            }`}
            onClick={() => { onSelect(null); setOpen(false); }}
          >
            All
          </button>
          {positions.map((pos) => (
            <button
              key={pos}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer ${
                selected === pos ? "font-medium text-gray-900" : "text-gray-600"
              }`}
              onClick={() => { onSelect(pos); setOpen(false); }}
            >
              {pos}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Toolbar({
  view = "list",
  onViewChange,
  filters = defaultFilters,
  onFiltersChange,
  callTodayCount = 0,
  updatedCount = 0,
  positions = [],
}: ToolbarProps) {
  const toggle = (key: keyof Omit<ActiveFilters, "position">) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200">
      <ViewToggle view={view} onChange={onViewChange} />

      <Button variant="outline" size="sm" icon={<FilterIcon />}>
        Filters
      </Button>

      <PositionDropdown
        positions={positions}
        selected={filters.position}
        onSelect={(pos) => onFiltersChange({ ...filters, position: pos })}
      />

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <FilterChip active={filters.new} onClick={() => toggle("new")}>
        New
      </FilterChip>

      <FilterChip
        active={filters.callToday}
        onClick={() => toggle("callToday")}
        count={callTodayCount}
      >
        Call today
      </FilterChip>

      <FilterChip
        active={filters.stars}
        onClick={() => toggle("stars")}
        icon={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#D9AC00" stroke="#D9AC00" strokeWidth="0.5">
            <path d="M8 1.5L9.79 5.12L13.76 5.7L10.88 8.5L11.58 12.45L8 10.56L4.42 12.45L5.12 8.5L2.24 5.7L6.21 5.12L8 1.5Z" />
          </svg>
        }
      >
        Above 4 stars
      </FilterChip>

      {view === "grid" && (
        <Button variant="outline" size="sm">
          Show
          <span className="text-gray-500 ml-0.5">All</span>
          <ChevronDownIcon className="text-gray-400" />
        </Button>
      )}

      <FilterChip
        active={filters.updated}
        onClick={() => toggle("updated")}
        count={updatedCount}
        showCount
      >
        Updated
      </FilterChip>

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
