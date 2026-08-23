import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 6;

export function ActivityListSkeleton() {
  return (
    <ul className="border-border/60 divide-y rounded-lg border">
      {Array.from({ length: ROWS }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="size-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-3 w-12" />
        </li>
      ))}
    </ul>
  );
}