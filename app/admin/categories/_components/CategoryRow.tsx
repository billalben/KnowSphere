"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, PencilIcon, TagIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

import type { tAdminCategory } from "@/app/data/admin/admin-get-categories";

interface CategoryRowProps {
  category: tAdminCategory;
}

export function CategoryRow({ category }: CategoryRowProps) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TagIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{category.name}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {category.slug}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton
              className={cn(
                "-mr-1.5 -mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground",
              )}
              aria-label="Category actions"
            >
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={2}>
              <DropdownMenuItem
                render={
                  <Link href={`/admin/categories/${category.id}/edit`} />
                }
              >
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                render={
                  <Link href={`/admin/categories/${category.id}/delete`} />
                }
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="tabular-nums">
            {category.courseCount}{" "}
            {category.courseCount === 1 ? "course" : "courses"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/admin/categories/${category.id}/edit`} />}
          nativeButton={false}
          className="flex-1"
        >
          <PencilIcon className="size-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          render={<Link href={`/admin/categories/${category.id}/delete`} />}
          nativeButton={false}
          className="flex-1"
        >
          <Trash2Icon className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}