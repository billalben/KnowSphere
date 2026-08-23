"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

import { useConstructUrl } from "@/hooks/use-construct";
import { cn } from "@/lib/utils";

interface CourseImageProps {
  fileKey: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  imageClassName?: string;
  compact?: boolean;
}

export function CourseImage({
  fileKey,
  alt,
  sizes,
  priority,
  imageClassName,
  compact = false,
}: CourseImageProps) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = useConstructUrl(fileKey);

  if (!fileKey || hasError) {
    return (
      <div
        role="img"
        aria-label={`${alt} has no cover image yet`}
        className="absolute inset-0 flex items-center justify-center bg-muted"
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-border backdrop-blur-sm",
            compact ? "size-8" : "size-14",
          )}
        >
          <ImageIcon
            className={cn(
              "text-muted-foreground",
              compact ? "size-3.5" : "size-7",
            )}
            aria-hidden
          />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", imageClassName)}
      onError={() => setHasError(true)}
    />
  );
}
