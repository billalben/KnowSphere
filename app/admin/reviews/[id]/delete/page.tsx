import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRating } from "@/components/general/StarRating";
import { adminGetReview } from "@/app/data/admin/admin-get-reviews";

import { DeleteReviewForm } from "./_components/DeleteReviewForm";

type Params = Promise<{ id: string }>;

export default async function DeleteReviewPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const review = await adminGetReview(id);

  if (!review) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader backHref="/admin/reviews" title="Delete Review" />

      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Are you sure?</CardTitle>
            <CardDescription>
              This action cannot be undone. This will permanently delete the
              review from <strong>{review.user.name}</strong> on{" "}
              <strong>{review.course.title}</strong>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} size="sm" />
              <span className="text-sm tabular-nums text-muted-foreground">
                {review.rating}/5
              </span>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {review.comment}
            </div>
            <DeleteReviewForm reviewId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
