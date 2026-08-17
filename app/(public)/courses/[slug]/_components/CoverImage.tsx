"use client";

import { useConstructUrl } from "@/hooks/use-construct";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface CoverImageProps {
  fileKey: string;
  title: string;
  className?: string;
}

export function CoverImage({ fileKey, title, className }: CoverImageProps) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = useConstructUrl(fileKey);
  const src = imageError || !fileKey ? "/course-placeholder.png" : imageUrl;

  return (
    <div
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm",
        className,
      )}
    >
      <Image
        src={src}
        alt={title}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => setImageError(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
}
