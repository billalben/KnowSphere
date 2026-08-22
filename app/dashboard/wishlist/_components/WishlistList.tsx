"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkIcon, Loader2Icon } from "lucide-react";

import { EmptyState } from "@/components/general/EmptyState";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { type tWishlistPage } from "@/app/data/user/get-wishlist-courses";

import { WishlistCard } from "./WishlistCard";
import { getWishlistPageAction } from "./wishlist-actions";

interface WishlistListProps {
  initialPage: tWishlistPage;
}

export function WishlistList({ initialPage }: WishlistListProps) {
  const [items, setItems] = useState(initialPage.items);
  const [total, setTotal] = useState(initialPage.total);
  const [page, setPage] = useState(initialPage.page);
  const pageSize = initialPage.pageSize;
  const [loadingMore, setLoadingMore] = useState(false);

  const hasMore = page * pageSize < total;

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setTotal((value) => Math.max(0, value - 1));
  }

  async function loadMore() {
    if (loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    const { data: result, error } = await tryCatch(
      getWishlistPageAction({ page: nextPage, pageSize }),
    );

    setLoadingMore(false);

    if (error || !result) {
      return;
    }

    if (result.status === "error" || !result.data) {
      return;
    }

    const pageData = result.data;
    setItems((prev) => [...prev, ...pageData.items]);
    setTotal(pageData.total);
    setPage(nextPage);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookmarkIcon}
        title="Your wishlist is empty"
        description="Browse the catalog and save courses you&apos;re interested in."
        action={
          <Link href="/courses" className={buttonVariants()}>
            Browse courses
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground tabular-nums">
            {total}
          </span>{" "}
          {total === 1 ? "course" : "courses"} saved
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <WishlistCard
            key={item.wishlistItemId}
            course={item}
            onRemove={handleRemove}
          />
        ))}
      </div>

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
    </div>
  );
}
