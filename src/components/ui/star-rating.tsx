import { useState } from "react";

export type StarRatingProps = {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  onChange?: (rating: number) => void;
  readOnly?: boolean;
};

function StarIcon({
  filled,
  hovered,
  size,
}: {
  filled: boolean;
  hovered: boolean;
  size: "sm" | "md" | "lg";
}) {
  const px = size === "sm" ? 14 : size === "md" ? 18 : 22;
  const isFilled = filled || hovered;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 16 16"
      fill={isFilled ? "var(--color-star-gold)" : "none"}
      stroke={isFilled ? "var(--color-star-gold)" : "var(--color-star-empty)"}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={hovered && !filled ? "opacity-50" : ""}
    >
      <path d="M8 1.5L9.79 5.12L13.76 5.7L10.88 8.5L11.58 12.45L8 10.56L4.42 12.45L5.12 8.5L2.24 5.7L6.21 5.12L8 1.5Z" />
    </svg>
  );
}

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  onChange,
  readOnly = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const interactive = !readOnly && !!onChange;

  return (
    <div
      className={`flex items-center gap-1 ${interactive ? "cursor-pointer" : ""}`}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            tabIndex={interactive ? 0 : -1}
            disabled={!interactive}
            className={`p-0 border-0 bg-transparent ${interactive ? "cursor-pointer" : "cursor-default"}`}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onClick={() => {
              if (!interactive) return;
              onChange(starValue === rating ? 0 : starValue);
            }}
          >
            <StarIcon
              filled={starValue <= rating}
              hovered={interactive && starValue <= hovered && starValue > rating}
              size={size}
            />
          </button>
        );
      })}
    </div>
  );
}
