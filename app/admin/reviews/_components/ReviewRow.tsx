import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpandableContent } from "@/components/ui/expandable-content";
import { StarRating } from "@/components/general/StarRating";
import { RelativeTime } from "@/components/general/RelativeTime";
import { type tAdminReview } from "@/app/data/admin/admin-get-reviews";
import { BookOpenIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

interface ReviewRowProps {
  review: tAdminReview;
}

export function ReviewRow({ review }: ReviewRowProps) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar size="sm">
              {review.user.image ? (
                <AvatarImage src={review.user.image} alt={review.user.name} />
              ) : null}
              <AvatarFallback>
                {review.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">
                {review.user.name}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {review.user.email}
              </p>
            </div>
          </div>

          {review.isEdited ? (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Edited
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="sm" />
          <span className="text-xs text-muted-foreground tabular-nums">
            {review.rating}/5
          </span>
        </div>

        <Link
          href={`/courses/${review.course.slug}`}
          className="flex items-center gap-1.5 truncate text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
        >
          <BookOpenIcon className="size-3.5 shrink-0" />
          <span className="truncate">{review.course.title}</span>
        </Link>

        <ExpandableContent
          collapsedHeight={96}
          labels={{ showMore: "Read more" }}
          className="flex-1"
        >
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {review.comment}
          </p>
        </ExpandableContent>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3 text-xs">
          <RelativeTime
            date={review.createdAt}
            className="text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <Button
          render={
            <Link href={`/admin/reviews/${review.id}/delete`} />
          }
          variant="destructive"
          size="sm"
          className="w-full"
        >
          <Trash2Icon className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
