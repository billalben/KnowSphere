import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  avg: number;
  count: number;
  className?: string;
  showIcon?: boolean;
}

export function RatingBadge({
  avg,
  count,
  className,
  showIcon = true,
}: RatingBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-foreground/80",
        className,
      )}
      aria-label={`${avg.toFixed(1)} out of 5 from ${count} review${count === 1 ? "" : "s"}`}
    >
      {showIcon ? (
        <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
      ) : null}
      <span className="tabular-nums">{avg.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}
