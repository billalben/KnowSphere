import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<StarRatingProps["size"]>, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function StarRating({
  value,
  max = 5,
  size = "sm",
  className,
}: StarRatingProps) {
  const safe = Math.max(0, Math.min(max, value));
  const full = Math.floor(safe);
  const hasHalf = safe - full >= 0.5;

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${safe.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const isFull = i < full;
        const isHalf = !isFull && i === full && hasHalf;

        return (
          <span
            key={i}
            className={cn("relative inline-flex shrink-0", sizeMap[size])}
            aria-hidden
          >
            <StarIcon className="size-full fill-muted text-muted-foreground/40" />
            {isFull ? (
              <StarIcon className="absolute inset-0 size-full fill-amber-400 text-amber-400" />
            ) : isHalf ? (
              <span className="absolute inset-0 w-1/2 overflow-hidden">
                <StarIcon className="size-full fill-amber-400 text-amber-400" />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
