"use client";

import { useState, useTransition } from "react";
import { HeartIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";

import { toggleCommentLikeAction } from "../../_lib/comment-actions";

interface LikeButtonProps {
  commentId: string;
  likedByMe: boolean;
  likeCount: number;
}

export function LikeButton({ commentId, likedByMe, likeCount }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({ likedByMe, likeCount });

  function handleToggle() {
    if (isPending) return;

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        toggleCommentLikeAction({ commentId }),
      );

      if (error || !result) {
        toast.error("Unexpected error. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      if (result.data) {
        setState({
          likedByMe: result.data.likedByMe,
          likeCount: result.data.likeCount,
        });
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="xs"
      className="gap-1.5 text-muted-foreground"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="size-3 animate-spin" />
      ) : (
        <HeartIcon
          className={
            state.likedByMe
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground"
          }
        />
      )}
      <span>{state.likeCount}</span>
    </Button>
  );
}
