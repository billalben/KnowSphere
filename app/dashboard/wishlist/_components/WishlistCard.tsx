"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/app/(public)/courses/_components/CourseCard";
import { type tWishlistCourse } from "@/app/data/user/get-wishlist-courses";
import { tryCatch } from "@/hooks/try-catch";

import { removeFromWishlistAction } from "@/app/(public)/courses/[slug]/_components/wishlist-actions";

interface WishlistCardProps {
  course: tWishlistCourse;
  onRemove: (id: string) => void;
}

export function WishlistCard({ course, onRemove }: WishlistCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isHovering, setIsHovering] = useState(false);

  function handleRemove(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        removeFromWishlistAction({ courseId: course.id }),
      );

      if (error || !result) {
        toast.error("Unexpected error. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onRemove(course.id);
      router.refresh();
    });
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CourseCard course={course} />

      {course.isEnrolled ? (
        <Badge
          variant="secondary"
          className="pointer-events-none absolute top-3 left-3 z-10 gap-1 bg-background/90 text-foreground backdrop-blur-sm"
        >
          <BookmarkCheckIcon className="size-3" />
          Enrolled
        </Badge>
      ) : null}

      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        aria-label={`Remove ${course.title} from wishlist`}
        className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur-sm transition hover:bg-background hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <XIcon
            className="size-4 transition-opacity"
            style={{ opacity: isHovering ? 1 : 0.85 }}
          />
        )}
      </button>
    </div>
  );
}
