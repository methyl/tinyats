import { type ReactNode, type ButtonHTMLAttributes } from "react";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  size?: "sm" | "md";
  active?: boolean;
};

export function IconButton({
  icon,
  label,
  size = "sm",
  active = false,
  className = "",
  ...props
}: IconButtonProps) {
  const sizeClass = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <button
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer
        ${sizeClass}
        ${
          active
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
        }
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}
