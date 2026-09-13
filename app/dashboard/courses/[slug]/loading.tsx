import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseOverviewLoading() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />

        <Skeleton className="aspect-video w-full rounded-xl" />

        <div className="space-y-3">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>

        <Skeleton className="h-11 w-48" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} size="sm" className="overflow-hidden p-0">
              <div className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-4" />
                <Skeleton className="size-4" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-2 border-t px-3 py-3">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5"
                  >
                    <Skeleton className="size-7 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="size-4" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
