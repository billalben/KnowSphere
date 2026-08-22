"use client";

import { StarIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface StarRatingPickerProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const sizeMap: Record<NonNullable<StarRatingPickerProps["size"]>, string> = {
  sm: "size-5",
  md: "size-7",
  lg: "size-9",
};

export function StarRatingPicker({
  value,
  onChange,
  max = 5,
  size = "lg",
  disabled = false,
  className,
}: StarRatingPickerProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      role="radiogroup"
      aria-label="Pick your rating"
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const active = starValue <= display;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            disabled={disabled}
            className={cn(
              "rounded-sm p-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              !disabled && "hover:scale-110",
            )}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
          >
            <StarIcon
              className={cn(
                sizeMap[size],
                active
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
