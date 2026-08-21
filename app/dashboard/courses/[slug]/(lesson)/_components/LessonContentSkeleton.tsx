import { Skeleton } from "@/components/ui/skeleton";

export function LessonContentSkeleton() {
  return (
    <>
      <Skeleton className="aspect-video w-full rounded-xl" />

      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-11 w-56" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-28" />
            <Skeleton className="h-11 w-20" />
          </div>
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
      </div>
    </>
  );
}
