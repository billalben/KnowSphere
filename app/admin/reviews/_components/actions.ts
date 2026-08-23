"use server";

import { revalidatePath } from "next/cache";

import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/prisma";
import { request } from "@arcjet/next";
import { errorResponse, successResponse } from "@/lib/responses";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { adminLog } from "@/lib/activity/admin-log";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    }),
  );

export async function deleteReviewAction({
  reviewId,
}: {
  reviewId: string;
}) {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests", null);
    }

    const review = await prisma.courseReview.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        rating: true,
        comment: true,
        course: { select: { slug: true, title: true } },
      },
    });

    if (!review) {
      return errorResponse("Review not found", null);
    }

    await prisma.courseReview.delete({
      where: { id: reviewId },
    });

    await adminLog({
      action: "REVIEW_DELETED",
      entityType: "REVIEW",
      entityId: review.id,
      entityLabel: review.course.title,
      metadata: {
        rating: review.rating,
        courseSlug: review.course.slug,
        commentPreview: review.comment.slice(0, 120),
      },
    });

    revalidatePath("/admin/reviews");
    revalidatePath(`/courses/${review.course.slug}`);
    revalidatePath("/courses");

    return successResponse("Review deleted successfully", null);
  } catch {
    return errorResponse("Failed to delete review", null);
  }
}
