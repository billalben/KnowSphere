import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-72" />

      <Card className="mx-auto max-w-md">
        <CardHeader className="items-center text-center">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="mt-2 h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex items-center justify-center pb-8">
          <Skeleton className="size-5" />
        </CardContent>
      </Card>
    </div>
  );
}
