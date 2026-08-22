"use client";

import { formatRelativeTime } from "@/lib/format-relative-time";
import { useNow } from "@/hooks/use-now";

interface RelativeTimeProps {
  date: Date;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  useNow();

  return (
    <span className={className} title={new Date(date).toLocaleString()}>
      {formatRelativeTime(date)}
    </span>
  );
}
