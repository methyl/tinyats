import { type ReactNode, type ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md";
  icon?: ReactNode;
  children?: ReactNode;
};

const variants = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 border border-gray-800 shadow-sm",
  secondary:
    "bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 shadow-sm",
  outline:
    "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300/80 shadow-sm",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent",
};

const sizes = {
  sm: "h-8 px-3 text-[12px] gap-1.5 tracking-[-0.12px]",
  md: "h-10 px-4 text-sm gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-colors cursor-pointer whitespace-nowrap
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
