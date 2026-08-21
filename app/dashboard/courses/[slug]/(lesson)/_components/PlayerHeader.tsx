import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

interface PlayerHeaderProps {
  courseTitle: string;
}

export function PlayerHeader({ courseTitle }: PlayerHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" aria-hidden />
        Back to dashboard
      </Link>
      <span className="text-sm text-muted-foreground/60">/</span>
      <span className="line-clamp-1 text-sm font-medium">{courseTitle}</span>
    </div>
  );
}
