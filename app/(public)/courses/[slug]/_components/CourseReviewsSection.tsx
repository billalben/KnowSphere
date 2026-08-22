"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarIcon } from "lucide-react";

import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";
import { EmptyState } from "@/components/general/EmptyState";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { type tCourseReviewView } from "@/types/course-reviews";

interface CourseReviewsSectionProps {
  courseId: string;
  isEnrolled: boolean;
  currentUserId: string | null;
  initialReviews: tCourseReviewView[];
  initialTotal: number;
  initialAvg: number;
  initialCount: number;
  myReview: tCourseReviewView | null;
}

export function CourseReviewsSection({
  courseId,
  isEnrolled,
  currentUserId,
  initialReviews,
  initialTotal,
  initialAvg,
  initialCount,
  myReview: initialMyReview,
}: CourseReviewsSectionProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<boolean>(false);
  // Holds the most recent server-confirmed value of the current user's review
  // after they submit or edit. It is layered on top of the server-rendered
  // `initialMyReview` so the UI reflects the change immediately without
  // waiting for the next server render.
  const [optimisticMyReview, setOptimisticMyReview] =
    useState<tCourseReviewView | null>(null);

  const [, startRefresh] = useTransition();

  const myReview = optimisticMyReview ?? initialMyReview;

  const mergedReviews = useMemo(() => {
    if (!optimisticMyReview) return initialReviews;

    const idx = initialReviews.findIndex((r) => r.id === optimisticMyReview.id);
    if (idx === -1) {
      return [optimisticMyReview, ...initialReviews];
    }
    const next = initialReviews.slice();
    next[idx] = optimisticMyReview;
    return next;
  }, [initialReviews, optimisticMyReview]);

  const total = initialTotal + (optimisticMyReview ? 0 : 0);

  function onReviewSubmitted(review: tCourseReviewView) {
    setOptimisticMyReview(review);
    setEditing(false);
    startRefresh(() => {
      router.refresh();
    });
  }

  const showForm = isEnrolled && (editing || !myReview);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Student Reviews
          </h2>
          {initialCount > 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-base font-semibold text-foreground tabular-nums">
                {initialAvg.toFixed(1)}
              </span>
              <StarIcon className="size-4 fill-amber-400 text-amber-400" />
              <span>·</span>
              <span>
                {initialCount} {initialCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          ) : null}
        </div>

        {isEnrolled && myReview && !editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit your review
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <ReviewForm
          courseId={courseId}
          existingReview={editing ? myReview : null}
          onSuccess={onReviewSubmitted}
          onCancel={editing ? () => setEditing(false) : undefined}
        />
      ) : null}

      {mergedReviews.length === 0 ? (
        <EmptyState
          icon={StarIcon}
          title="No reviews yet"
          description={
            isEnrolled
              ? "Be the first to share your experience with this course."
              : "Enroll in the course to leave a review."
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {mergedReviews.map((review, idx) => (
            <div key={review.id}>
              {idx > 0 ? <Separator /> : null}
              <div className="px-5">
                <ReviewItem
                  review={review}
                  currentUserId={currentUserId}
                  onEdit={() => setEditing(true)}
                />
              </div>
            </div>
          ))}
          {total > mergedReviews.length ? (
            <div className="border-t border-border p-4 text-center text-xs text-muted-foreground">
              Showing the most recent {mergedReviews.length} of {total} reviews.
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
