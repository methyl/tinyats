export type ViewToggleProps = {
  view: "grid" | "list";
  onChange?: (view: "grid" | "list") => void;
};

function GridIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" />
      <rect x="7" y="0.5" width="4.5" height="4.5" rx="1" />
      <rect x="0.5" y="7" width="4.5" height="4.5" rx="1" />
      <rect x="7" y="7" width="4.5" height="4.5" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M1.5 2.5h9M1.5 6h9M1.5 9.5h9" />
    </svg>
  );
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center h-8 rounded-lg border border-gray-300/80 bg-white shadow-sm px-[3px] gap-1">
      <button
        onClick={() => onChange?.("grid")}
        className={`
          flex items-center justify-center h-[24px] w-[30px] rounded-md transition-colors cursor-pointer
          ${view === "grid" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:text-gray-800"}
        `}
        aria-label="Grid view"
      >
        <GridIcon />
      </button>
      <button
        onClick={() => onChange?.("list")}
        className={`
          flex items-center justify-center h-[24px] w-[30px] rounded-md transition-colors cursor-pointer
          ${view === "list" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:text-gray-800"}
        `}
        aria-label="List view"
      >
        <ListIcon />
      </button>
    </div>
  );
}
