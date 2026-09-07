"use client";

import { CourseImage } from "@/components/general/CourseImage";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  imageUrl: string | null;
  title: string;
  className?: string;
}

export function CoverImage({ imageUrl, title, className }: CoverImageProps) {
  return (
    <div
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm",
        className,
      )}
    >
      <CourseImage
        imageUrl={imageUrl}
        alt={title}
        priority
        sizes="(max-width: 1024px) 100vw, 70vw"
        imageClassName="transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
}
