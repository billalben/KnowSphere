"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";

import { enrollInCourseAction } from "../actions";

interface EnrollmentButtonProps {
  courseId: string;
  slug: string;
  isEnrolled: boolean;
  isSignedIn: boolean;
  price: number;
}

export function EnrollmentButton({
  courseId,
  slug,
  isEnrolled,
  isSignedIn,
  price,
}: EnrollmentButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFree = !price;

  if (!isSignedIn) {
    return (
      <Button
        className="w-full"
        size="lg"
        render={<Link href={`/login?redirect=/courses/${slug}`} />}
      >
        Sign in to enroll
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button
        className="w-full"
        size="lg"
        variant="secondary"
        render={<Link href={`/courses/${slug}`} />}
      >
        <CheckIcon className="size-4" />
        Already enrolled
      </Button>
    );
  }

  function handleEnroll() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        enrollInCourseAction({ courseId }),
      );

      if (error || !result) {
        toast.error("Unexpected error. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      if (result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
        return;
      }

      // Free course activated server-side -- re-render to swap the button state.
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleEnroll}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>{isFree ? "Enroll for free" : "Enroll now"}</>
      )}
    </Button>
  );
}