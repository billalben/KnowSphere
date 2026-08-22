import { adminGetReviews } from "@/app/data/admin/admin-get-reviews";
import { EmptyState } from "@/components/general/EmptyState";
import { StarIcon } from "lucide-react";

import { ReviewRow } from "./ReviewRow";

export async function ReviewsList() {
  const reviews = await adminGetReviews();

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={StarIcon}
        title="No reviews yet"
        description="When students leave a rating and comment, it will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground tabular-nums">
            {reviews.length}
          </span>{" "}
          {reviews.length === 1 ? "review" : "reviews"} total
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => (
          <ReviewRow key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
