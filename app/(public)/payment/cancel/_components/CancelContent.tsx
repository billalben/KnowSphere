"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  AlertCircleIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function pickCourseHref(referrer: string): string {
  try {
    const url = new URL(referrer);
    const match = url.pathname.match(/^\/courses\/([^\/?#]+)\/?$/);
    if (match) return `/courses/${match[1]}`;
  } catch {
    return "/courses";
  }
  return "/courses";
}

function getClientRetryHref(): string {
  if (typeof document === "undefined" || !document.referrer) return "/courses";
  return pickCourseHref(document.referrer);
}

function getServerRetryHref(): string {
  return "/courses";
}

function subscribe(): () => void {
  return () => {};
}

export function CancelContent() {
  const retryHref = useSyncExternalStore(
    subscribe,
    getClientRetryHref,
    getServerRetryHref,
  );

  return (
    <div className="relative mx-auto w-full max-w-md px-4 md:px-6">
      <Card className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 animation-duration-500">
        <CardHeader className="items-center text-center gap-3">
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden
              className="absolute size-24 rounded-full bg-amber-500/20 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute size-16 rounded-full border border-amber-500/30"
            />
            <AlertCircleIcon
              className="relative size-14 text-amber-500"
              strokeWidth={2}
              aria-hidden
            />
          </div>

          <Badge variant="secondary" className="gap-1.5 mx-auto">
            <XIcon className="size-3" />
            Payment cancelled
          </Badge>

          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
            No worries — you weren&apos;t charged.
          </CardTitle>
          <CardDescription className="text-base">
            Your card wasn&apos;t charged and no order was created. You can try
            again whenever you&apos;re ready.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
            <ShieldCheckIcon
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Your payment info is secure</p>
              <p className="text-xs text-muted-foreground">
                We never store card details, and a cancellation never results in
                a charge.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href={retryHref}
              className={buttonVariants({ size: "lg", className: "flex-1" })}
            >
              <RotateCcwIcon className="size-4" />
              Try again
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
