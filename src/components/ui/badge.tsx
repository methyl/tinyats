export type BadgeProps = {
  count: number;
  variant?: "default" | "danger";
};

export function Badge({ count, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
        text-xs font-medium rounded-md
        ${
          variant === "danger"
            ? "bg-status-first-call text-white"
            : "bg-gray-800 text-white"
        }
      `}
    >
      {count}
    </span>
  );
}
