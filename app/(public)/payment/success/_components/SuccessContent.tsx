"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRightIcon,
  CircleCheckBigIcon,
  InfinityIcon,
  MailIcon,
  SparklesIcon,
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
import { Separator } from "@/components/ui/separator";
import { useConfetti } from "@/hooks/use-confetti";

export function SuccessContent() {
  const triggerConfetti = useConfetti();

  useEffect(() => {
    triggerConfetti();
  }, [triggerConfetti]);

  return (
    <div className="relative mx-auto w-full max-w-md px-4 md:px-6">
      <Card className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 animation-duration-500">
        <CardHeader className="items-center text-center gap-3">
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden
              className="absolute size-24 rounded-full bg-emerald-500/20 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute size-16 rounded-full border border-emerald-500/30"
            />

            <CircleCheckBigIcon
              className="relative size-14 text-emerald-500"
              strokeWidth={2}
              aria-hidden
            />
          </div>

          <Badge variant="secondary" className="gap-1.5 mx-auto">
            <SparklesIcon className="size-3" />
            Payment successful
          </Badge>

          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
            You&apos;re all set!
          </CardTitle>

          <CardDescription className="text-base">
            Your enrollment is confirmed. Head to your course whenever
            you&apos;re ready.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <InfinityIcon className="size-4 text-primary" aria-hidden />
                Course access
              </span>
              <span className="font-medium">Lifetime</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MailIcon className="size-4 text-primary" aria-hidden />
                Email receipt
              </span>
              <span className="font-medium">Sent to your inbox</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            We&apos;ve also emailed a receipt for your records.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/courses"
              className={buttonVariants({ size: "lg", className: "flex-1" })}
            >
              Browse courses
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
