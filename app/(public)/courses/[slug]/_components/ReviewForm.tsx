"use client";

import { useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingPicker } from "@/components/general/StarRatingPicker";
import { tryCatch } from "@/hooks/try-catch";
import { type tCourseReviewView } from "@/types/course-reviews";

import {
  editReviewAction,
  submitReviewAction,
} from "./review-actions";

interface ReviewFormProps {
  courseId: string;
  existingReview: tCourseReviewView | null;
  onSuccess?: (review: tCourseReviewView) => void;
  onCancel?: () => void;
}

export function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const isEdit = Boolean(existingReview);
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 0);
  const [comment, setComment] = useState<string>(existingReview?.comment ?? "");
  const [isPending, startTransition] = useTransition();

  const trimmedLength = comment.trim().length;
  const ratingValid = rating >= 1 && rating <= 5;
  const commentValid = trimmedLength >= 10 && trimmedLength <= 2000;
  const canSubmit = ratingValid && commentValid && !isPending;

  function handleSubmit() {
    if (!ratingValid) {
      toast.error("Please pick a rating from 1 to 5 stars");
      return;
    }
    if (!commentValid) {
      toast.error(
        trimmedLength < 10
          ? "Please write at least 10 characters of feedback"
          : "Comment is too long",
      );
      return;
    }

    startTransition(async () => {
      const action = isEdit
        ? editReviewAction({
            reviewId: existingReview!.id,
            rating,
            comment,
          })
        : submitReviewAction({ courseId, rating, comment });

      const { data: result, error } = await tryCatch(action);

      if (error || !result) {
        toast.error("Unexpected error. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      if (result.data) {
        toast.success(result.message);
        onSuccess?.(result.data);
        if (!isEdit) {
          setRating(0);
          setComment("");
        }
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Your rating</Label>
        <StarRatingPicker value={rating} onChange={setRating} size="md" />
        {rating === 0 ? (
          <p className="text-xs text-muted-foreground">Pick a rating</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment" className="text-sm font-medium">
          Your review
        </Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what you liked, what could be improved, and who this course is for..."
          rows={5}
          maxLength={2000}
          disabled={isPending}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {trimmedLength < 10
              ? `${10 - trimmedLength} more character${10 - trimmedLength === 1 ? "" : "s"} needed`
              : `${trimmedLength}/2000`}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              {isEdit ? "Saving..." : "Submitting..."}
            </>
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Submit review"
          )}
        </Button>
      </div>
    </div>
  );
}
