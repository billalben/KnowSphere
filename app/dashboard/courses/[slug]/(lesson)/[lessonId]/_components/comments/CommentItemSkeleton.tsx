import { Skeleton } from "@/components/ui/skeleton";

export function CommentItemSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    </div>
  );
}
