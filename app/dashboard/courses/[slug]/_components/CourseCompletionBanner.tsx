"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AwardIcon,
  ExternalLinkIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";

import { claimCertificateAction } from "../../../certificates/actions";

interface CourseCompletionBannerProps {
  courseId: string;
  courseSlug: string;
  totalLessons: number;
  completedLessons: number;
  certificate: {
    id: string;
    verificationCode: string;
  } | null;
}

export function CourseCompletionBanner({
  courseId,
  courseSlug,
  totalLessons,
  completedLessons,
  certificate,
}: CourseCompletionBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isFullyCompleted =
    totalLessons > 0 && completedLessons >= totalLessons;

  if (!isFullyCompleted) return null;

  if (certificate) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AwardIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              You earned a certificate!
            </p>
            <p className="text-sm text-muted-foreground">
              Share your achievement with anyone using the public link.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          render={
            <Link
              href={`/certificates/${certificate.verificationCode}`}
              target="_blank"
            />
          }
        >
          View certificate
          <ExternalLinkIcon className="size-4" />
        </Button>
      </div>
    );
  }

  function handleClaim() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        claimCertificateAction({ courseId }),
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
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SparklesIcon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">You finished the course!</p>
          <p className="text-sm text-muted-foreground">
            Claim your certificate to get a shareable public link.
          </p>
        </div>
      </div>
      <Button size="sm" onClick={handleClaim} disabled={isPending}>
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <AwardIcon className="size-4" />
        )}
        Claim certificate
      </Button>
      <span className="sr-only">
        Certificate claim available for course {courseSlug}
      </span>
    </div>
  );
}
