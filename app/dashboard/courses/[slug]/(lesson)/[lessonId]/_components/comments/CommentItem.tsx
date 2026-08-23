"use client";

import { useState, useTransition } from "react";
import {
  CornerDownRightIcon,
  Loader2Icon,
  MessageCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tryCatch } from "@/hooks/try-catch";
import { REPLY_PAGE_SIZE } from "@/lib/constants/comments";
import { RelativeTime } from "@/components/general/RelativeTime";
import { type tLessonCommentView } from "@/types/comments";

import {
  createReplyAction,
  deleteCommentAction,
  editCommentAction,
  getRepliesPageAction,
} from "../../_lib/comment-actions";
import { CommentForm } from "./CommentForm";
import { CommentMenu } from "./CommentMenu";
import { CommentItemSkeleton } from "./CommentItemSkeleton";
import { LikeButton } from "./LikeButton";

interface CommentItemProps {
  comment: tLessonCommentView;
  currentUserId: string;
  currentUserRole: string | null;
  variant?: "root" | "reply";
  onDelete?: (id: string) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  variant = "root",
  onDelete,
}: CommentItemProps) {
  const [c, setC] = useState(comment);
  const [isEditing, setIsEditing] = useState(false);
  const [, startDelete] = useTransition();

  const [isReplying, setIsReplying] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState<tLessonCommentView[]>([]);
  const [repliesPage, setRepliesPage] = useState(0);
  const [repliesTotal, setRepliesTotal] = useState(0);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLoadingMore, setRepliesLoadingMore] = useState(false);

  const isRoot = variant === "root";
  const isAdmin = c.author.role === "admin";
  const canEdit = c.author.id === currentUserId;
  const canDelete =
    c.author.id === currentUserId || currentUserRole === "admin";
  const repliesHasMore = repliesPage * REPLY_PAGE_SIZE < repliesTotal;

  async function submitEdit(content: string): Promise<boolean> {
    const { data: result, error } = await tryCatch(
      editCommentAction({ commentId: c.id, content }),
    );

    if (error || !result) {
      toast.error("Unexpected error. Please try again.");
      return false;
    }

    if (result.status === "error") {
      toast.error(result.message);
      return false;
    }

    if (result.data) {
      setC(result.data);
    }
    setIsEditing(false);
    return true;
  }

  function handleDelete() {
    startDelete(async () => {
      const { data: result, error } = await tryCatch(
        deleteCommentAction({ commentId: c.id }),
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
      onDelete?.(c.id);
    });
  }

  function openReplies() {
    if (repliesOpen || repliesLoading) return;

    setRepliesLoading(true);

    (async () => {
      const { data: result, error } = await tryCatch(
        getRepliesPageAction({
          commentId: c.id,
          page: 1,
          pageSize: REPLY_PAGE_SIZE,
        }),
      );

      if (error || !result || result.status === "error" || !result.data) {
        toast.error(result?.message ?? "Failed to load replies");
        setRepliesLoading(false);
        return;
      }

      setReplies(result.data.items);
      setRepliesPage(1);
      setRepliesTotal(result.data.total);
      setRepliesLoading(false);
      setRepliesOpen(true);
    })();
  }

  function loadMoreReplies() {
    if (repliesLoadingMore) return;

    const nextPage = repliesPage + 1;
    setRepliesLoadingMore(true);

    (async () => {
      const { data: result, error } = await tryCatch(
        getRepliesPageAction({
          commentId: c.id,
          page: nextPage,
          pageSize: REPLY_PAGE_SIZE,
        }),
      );

      if (error || !result || result.status === "error" || !result.data) {
        toast.error(result?.message ?? "Failed to load replies");
        setRepliesLoadingMore(false);
        return;
      }

const pageData = result.data;
        setReplies((prev) => {
          const seen = new Set(prev.map((r) => r.id));
          const incoming = pageData.items.filter((r) => !seen.has(r.id));
          return incoming.length > 0 ? [...prev, ...incoming] : prev;
        });
        setRepliesPage(nextPage);
        setRepliesTotal(pageData.total);
        setRepliesLoadingMore(false);
    })();
  }

  async function submitReply(content: string): Promise<boolean> {
    const { data: result, error } = await tryCatch(
      createReplyAction({ commentId: c.id, content }),
    );

    if (error || !result) {
      toast.error("Unexpected error. Please try again.");
      return false;
    }

    if (result.status === "error") {
      toast.error(result.message);
      return false;
    }

    if (result.data) {
      setC((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }));
      setIsReplying(false);
      await refetchRepliesPage();
    } else {
      setIsReplying(false);
      setRepliesOpen(true);
    }
    return true;
  }

  async function refetchRepliesPage() {
    setRepliesLoading(true);

    const { data: result, error } = await tryCatch(
      getRepliesPageAction({
        commentId: c.id,
        page: 1,
        pageSize: REPLY_PAGE_SIZE,
      }),
    );

    if (error || !result || result.status === "error" || !result.data) {
      toast.error(result?.message ?? "Failed to load replies");
      setRepliesLoading(false);
      setRepliesOpen(true);
      return;
    }

    setReplies(result.data.items);
    setRepliesPage(1);
    setRepliesTotal(result.data.total);
    setRepliesLoading(false);
    setRepliesOpen(true);
  }

  function handleDeleteReply(id: string) {
    setReplies((prev) => prev.filter((reply) => reply.id !== id));
    setRepliesTotal((total) => total - 1);
    setC((prev) => ({ ...prev, replyCount: Math.max(0, prev.replyCount - 1) }));
  }

  return (
    <div
      className={cn(
        "flex gap-3",
        isRoot ? "py-4" : "py-2.5",
        isAdmin && "rounded-lg bg-primary/5 p-3",
      )}
    >
      <Avatar size={isRoot ? "default" : "sm"}>
        {c.author.image ? (
          <AvatarImage src={c.author.image} alt={c.author.name} />
        ) : null}
        <AvatarFallback>{c.author.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{c.author.name}</span>
          {isAdmin ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Admin
            </span>
          ) : null}
          <RelativeTime
            date={c.createdAt}
            className="text-xs text-muted-foreground"
          />
          {c.isEdited ? (
            <span className="text-xs italic text-muted-foreground">
              (edited)
            </span>
          ) : null}
          <div className="ml-auto">
            <CommentMenu
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {isEditing ? (
          <CommentForm
            defaultValue={c.content}
            submitLabel="Save"
            resetOnSuccess={false}
            onSubmit={submitEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm">{c.content}</p>
        )}

        <div className="flex items-center gap-1">
          <LikeButton
            commentId={c.id}
            likedByMe={c.likedByMe}
            likeCount={c.likeCount}
          />
          {isRoot ? (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => setIsReplying((value) => !value)}
            >
              <CornerDownRightIcon />
              Reply
            </Button>
          ) : null}
        </div>

        {isRoot && isReplying ? (
          <CommentForm
            onSubmit={submitReply}
            submitLabel="Reply"
            placeholder="Write a reply..."
            onCancel={() => setIsReplying(false)}
          />
        ) : null}

        {isRoot && c.replyCount > 0 && !repliesOpen ? (
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0 text-muted-foreground"
            onClick={openReplies}
            disabled={repliesLoading}
          >
            <MessageCircleIcon />
            View {c.replyCount} {c.replyCount === 1 ? "reply" : "replies"}
          </Button>
        ) : null}

        {isRoot && repliesLoading && replies.length === 0 ? (
          <div className="space-y-2 border-l-2 border-border pl-4">
            <CommentItemSkeleton />
            <CommentItemSkeleton />
          </div>
        ) : null}

        {isRoot && repliesOpen ? (
          <div className="mt-2 space-y-2 border-l-2 border-border pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                variant="reply"
                onDelete={handleDeleteReply}
              />
            ))}
            {repliesHasMore ? (
              <Button
                variant="link"
                size="sm"
                className="h-auto w-fit gap-1.5 px-0 text-muted-foreground"
                onClick={loadMoreReplies}
                disabled={repliesLoadingMore}
              >
                {repliesLoadingMore ? (
                  <Loader2Icon className="size-3 animate-spin" />
                ) : null}
                Load more replies
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}