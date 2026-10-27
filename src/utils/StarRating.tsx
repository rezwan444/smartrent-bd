"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "xs" | "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  showValue?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function StarRating({
  rating,
  maxStars = 5,
  size = "sm",
  interactive = false,
  onRatingChange,
  showValue = false,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined}>
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((starNumber) => {
          const isFilled = starNumber <= displayRating;
          const isHalf = !isFilled && starNumber - 0.5 <= displayRating;

          return (
            <button
              key={starNumber}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive
                  ? "cursor-pointer transition-transform hover:scale-115 focus:outline-none"
                  : "cursor-default"
              } p-0.5 rounded-xs`}
              aria-label={interactive ? `${starNumber} star${starNumber > 1 ? "s" : ""}` : undefined}
            >
              <Star
                className={`${sizeClass} transition-colors ${
                  isFilled
                    ? "fill-amber-500 text-amber-500"
                    : isHalf
                    ? "fill-amber-500/50 text-amber-500"
                    : "fill-muted/40 text-border"
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-bold text-foreground ml-1 tabular-nums">
          {rating > 0 ? rating.toFixed(1) : "0.0"}
        </span>
      )}
    </div>
  );
}
