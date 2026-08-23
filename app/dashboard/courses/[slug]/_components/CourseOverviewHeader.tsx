import Link from "next/link";
import { ChevronLeftIcon, PlayCircleIcon } from "lucide-react";

import { CourseImage } from "@/components/general/CourseImage";
import { Button } from "@/components/ui/button";

interface CourseOverviewHeaderProps {
  slug: string;
  title: string;
  smallDesc: string;
  fileKey: string | null;
  resumeLessonId: string | null;
  hasStarted: boolean;
}

export function CourseOverviewHeader({
  slug,
  title,
  smallDesc,
  fileKey,
  resumeLessonId,
  hasStarted,
}: CourseOverviewHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          Back to dashboard
        </Link>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
        <CourseImage
          fileKey={fileKey}
          alt={title}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {smallDesc}
        </p>
      </div>

      {resumeLessonId ? (
        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link href={`/dashboard/courses/${slug}/${resumeLessonId}`} />
          }
        >
          <PlayCircleIcon className="size-4" />
          {hasStarted ? "Continue watching" : "Start watching course"}
        </Button>
      ) : null}
    </div>
  );
}
