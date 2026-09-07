"use client";

import { FilmIcon } from "lucide-react";

interface LessonVideoProps {
  videoUrl: string | null;
  title: string;
}

export function LessonVideo({ videoUrl, title }: LessonVideoProps) {
  if (!videoUrl) {
    return (
      <div
        role="img"
        aria-label={`${title} has no video yet`}
        className="flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border bg-muted text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
          <FilmIcon
            className="size-7 text-muted-foreground"
            aria-hidden
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Video coming soon</p>
          <p className="text-xs text-muted-foreground">
            The instructor hasn&apos;t uploaded this lesson yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-black">
      <video
        key={videoUrl}
        src={videoUrl}
        controls
        preload="metadata"
        playsInline
        className="aspect-video w-full"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
