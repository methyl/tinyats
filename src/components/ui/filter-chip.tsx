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

  // "Updated" with zero count = disabled-looking resting state from Pencil design
  const isMuted = hasCount && isZero && !active;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-3 h-8 rounded-lg text-[12px] font-medium
        tracking-[-0.12px] transition-colors cursor-pointer whitespace-nowrap border
        ${
          active
            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
            : isMuted
              ? "bg-[#F6F7F7] text-gray-500 border-transparent"
              : "bg-white text-gray-900 border-gray-300/80 shadow-sm hover:bg-gray-50"
        }
      `}
    >
      {icon}
      {children}
      {hasCount && (
        <span
          className={`
            inline-flex items-center justify-center px-1 py-[2px] min-w-[16px]
            text-[12px] font-medium leading-none rounded-[4px] tracking-[-0.12px]
            ${
              active
                ? "bg-white/20 text-white"
                : isZero
                  ? "bg-gray-200 text-gray-300"
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
