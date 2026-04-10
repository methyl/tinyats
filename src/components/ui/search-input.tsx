export type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  shortcut?: string;
};

export function SearchInput({
  placeholder = "Search people and positions",
  value,
  onChange,
  shortcut = "\u2318K",
}: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <svg
        className="absolute left-3 text-gray-500"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3.5 3.5" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="
          h-10 w-64 pl-9 pr-12 rounded-lg border border-gray-200 shadow-xs
          bg-white text-sm text-gray-900 placeholder:text-gray-500
          outline-none focus:border-gray-400 transition-colors
        "
      />
      {shortcut && (
        <span className="absolute right-3 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 font-medium">
          {shortcut}
        </span>
      )}
    </div>
  );
}
