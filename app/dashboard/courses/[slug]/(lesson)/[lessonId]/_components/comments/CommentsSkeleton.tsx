import { Skeleton } from "@/components/ui/skeleton";

export function CommentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-36" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-24 w-full rounded-md" />
        <div className="flex justify-end">
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-3 py-4">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}