import { type ReactNode } from "react";

export type FilterChipProps = {
  children: ReactNode;
  active?: boolean;
  count?: number;
  showCount?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
};

export function FilterChip({
  children,
  active = false,
  count,
  showCount = false,
  icon,
  onClick,
}: FilterChipProps) {
  const hasCount = count != null || showCount;
  const displayCount = count ?? 0;
  const isZero = displayCount === 0;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium
        transition-colors cursor-pointer whitespace-nowrap border shadow-xs
        ${
          active
            ? "bg-gray-800 text-white border-gray-800"
            : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
        }
      `}
    >
      {icon}
      {children}
      {hasCount && (
        <span
          className={`
            inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
            text-[11px] font-semibold rounded
            ${
              active
                ? "bg-white/20 text-white"
                : isZero
                  ? "bg-gray-100 text-gray-400"
                  : "bg-status-first-call text-white"
            }
          `}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
