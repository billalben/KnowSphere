"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";

import { deleteReviewAction } from "../../../_components/actions";

interface DeleteReviewFormProps {
  reviewId: string;
}

export function DeleteReviewForm({ reviewId }: DeleteReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        deleteReviewAction({ reviewId }),
      );

      if (error || !result) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        router.push("/admin/reviews");
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Deleting...
          </>
        ) : (
          "Delete Review"
        )}
      </Button>
    </div>
  );
}
