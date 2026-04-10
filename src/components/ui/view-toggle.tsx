export type ViewToggleProps = {
  view: "grid" | "list";
  onChange?: (view: "grid" | "list") => void;
};

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 3h12M2 8h12M2 13h12" />
    </svg>
  );
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden shadow-xs">
      <button
        onClick={() => onChange?.("grid")}
        className={`
          w-9 h-8 flex items-center justify-center transition-colors cursor-pointer
          ${view === "grid" ? "bg-gray-100 text-gray-800" : "bg-white text-gray-400 hover:text-gray-600"}
        `}
        aria-label="Grid view"
      >
        <GridIcon />
      </button>
      <button
        onClick={() => onChange?.("list")}
        className={`
          w-9 h-8 flex items-center justify-center transition-colors cursor-pointer
          border-l border-gray-200
          ${view === "list" ? "bg-gray-100 text-gray-800" : "bg-white text-gray-400 hover:text-gray-600"}
        `}
        aria-label="List view"
      >
        <ListIcon />
      </button>
    </div>
  );
}
