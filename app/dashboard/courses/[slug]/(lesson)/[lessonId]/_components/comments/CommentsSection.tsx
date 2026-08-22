"use client";

import { useState, useTransition } from "react";
import { ArrowUpDownIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tryCatch } from "@/hooks/try-catch";
import {
  type tCommentPage,
  type tCommentSort,
  type tLessonCommentView,
} from "@/types/comments";

import {
  createCommentAction,
  getCommentsPageAction,
} from "../../_lib/comment-actions";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface CommentsSectionProps {
  lessonId: string;
  initialPage: tCommentPage;
  currentUserId: string;
  currentUserRole: string | null;
}

export function CommentsSection({
  lessonId,
  initialPage,
  currentUserId,
  currentUserRole,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<tLessonCommentView[]>(
    initialPage.items,
  );
  const [total, setTotal] = useState(initialPage.total);
  const [page, setPage] = useState(initialPage.page);
  const [sort, setSort] = useState<tCommentSort>("newest");
  const [loadingMore, setLoadingMore] = useState(false);
  const [, startSubmit] = useTransition();

  const pageSize = initialPage.pageSize;
  const hasMore = page * pageSize < total;

  function handleSortChange(nextSort: tCommentSort) {
    if (nextSort === sort) return;
    setSort(nextSort);

    (async () => {
      const { data: result, error } = await tryCatch(
        getCommentsPageAction({ lessonId, page: 1, pageSize, sort: nextSort }),
      );

      if (error || !result || result.status === "error" || !result.data) {
        toast.error(result?.message ?? "Failed to load comments");
        return;
      }

      setComments(result.data.items);
      setTotal(result.data.total);
      setPage(1);
    })();
  }

  function loadMore() {
    if (loadingMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    (async () => {
      const { data: result, error } = await tryCatch(
        getCommentsPageAction({ lessonId, page: nextPage, pageSize, sort }),
      );

      if (error || !result || result.status === "error" || !result.data) {
        toast.error(result?.message ?? "Failed to load comments");
        setLoadingMore(false);
        return;
      }

      const pageData = result.data;
      setComments((prev) => [...prev, ...pageData.items]);
      setTotal(pageData.total);
      setPage(nextPage);
      setLoadingMore(false);
    })();
  }

  async function submitComment(content: string): Promise<boolean> {
    const { data: result, error } = await tryCatch(
      createCommentAction({ lessonId, content }),
    );

    if (error || !result) {
      toast.error("Unexpected error. Please try again.");
      return false;
    }

    if (result.status === "error") {
      toast.error(result.message);
      return false;
    }

    await refetchFirstPage();
    return true;
  }

  function refetchFirstPage() {
    return new Promise<void>((resolve) => {
      startSubmit(async () => {
        const { data: result, error } = await tryCatch(
          getCommentsPageAction({ lessonId, page: 1, pageSize, sort }),
        );

        if (error || !result || result.status === "error" || !result.data) {
          toast.error(result?.message ?? "Failed to refresh comments");
          resolve();
          return;
        }

        setComments(result.data.items);
        setTotal(result.data.total);
        setPage(1);
        resolve();
      });
    });
  }

  function handleDelete(id: string) {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
    setTotal((value) => value - 1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Comments{" "}
          <span className="text-muted-foreground text-sm font-normal">
            ({total})
          </span>
        </CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton
            className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-muted data-popup-open:text-foreground"
          >
            <ArrowUpDownIcon className="size-3.5" />
            <span>{sort === "oldest" ? "Oldest first" : "Newest first"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
              Oldest first
              {sort === "oldest" ? (
                <CheckIcon className="ml-auto size-4" />
              ) : null}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("newest")}>
              Newest first
              {sort === "newest" ? (
                <CheckIcon className="ml-auto size-4" />
              ) : null}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <CommentForm onSubmit={submitComment} />

        {comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {comments.map((comment) => (
              <CommentItem
                key={`${comment.id}-${sort}`}
                comment={comment}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {hasMore ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Load more
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
