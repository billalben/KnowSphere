import { Skeleton } from "@/components/ui/skeleton";

export default function CertificateLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-12 md:py-16">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-8 md:p-12">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>

        <div className="flex flex-col items-center gap-4 pt-6">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-3 w-44" />
        </div>

        <div className="space-y-2 pt-4 text-center">
          <Skeleton className="mx-auto h-8 w-72" />
          <Skeleton className="mx-auto h-3 w-48" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>

        <div className="border-t pt-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
