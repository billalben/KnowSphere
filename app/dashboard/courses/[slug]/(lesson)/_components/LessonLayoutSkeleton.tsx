import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { LessonContentSkeleton } from "./LessonContentSkeleton";

export function LessonLayoutSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <LessonContentSkeleton />
        </div>

        <aside className="lg:sticky lg:top-(--header-height) lg:self-start lg:max-h-[calc(100svh-var(--header-height)-1rem)] lg:overflow-y-auto">
          <Card className="overflow-hidden p-0">
            <div className="space-y-2 border-b p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>

            <div className="space-y-3 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2 rounded-md px-2 py-2">
                    <Skeleton className="size-4" />
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div className="ml-3 space-y-0.5 border-l pl-3">
                    {Array.from({ length: 3 }).map((__, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-2"
                      >
                        <Skeleton className="size-4 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="size-3.5" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
