import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RelativeTime } from "@/components/general/RelativeTime";
import { StarRating } from "@/components/general/StarRating";
import { type tCourseReviewView } from "@/types/course-reviews";

interface ReviewItemProps {
  review: tCourseReviewView;
  currentUserId: string | null;
  onEdit?: () => void;
}

export function ReviewItem({ review, currentUserId, onEdit }: ReviewItemProps) {
  const isOwner = review.author.id === currentUserId;
  const isAdmin = review.author.role === "admin";

  return (
    <div className="flex gap-3 py-4">
      <Avatar>
        {review.author.image ? (
          <AvatarImage src={review.author.image} alt={review.author.name} />
        ) : null}
        <AvatarFallback>
          {review.author.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{review.author.name}</span>
          {isAdmin ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Admin
            </span>
          ) : null}
          <RelativeTime
            date={review.createdAt}
            className="text-xs text-muted-foreground"
          />
          {review.isEdited ? (
            <span className="text-xs italic text-muted-foreground">
              (edited)
            </span>
          ) : null}
          {isOwner && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="ml-auto text-xs font-medium text-primary hover:underline underline-offset-4"
            >
              Edit
            </button>
          ) : null}
        </div>

        <StarRating value={review.rating} size="sm" />

        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {review.comment}
        </p>
      </div>
    </div>
  );
}
