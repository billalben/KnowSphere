import "server-only";

import prisma from "@/lib/prisma";

import { requireAdmin } from "./require-admin";

export async function adminGetReviews() {
  await requireAdmin();

  const reviews = await prisma.courseReview.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      isEdited: true,
      createdAt: true,
      updatedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return reviews;
}

export type tAdminReview = Awaited<
  ReturnType<typeof adminGetReviews>
>[number];

export async function adminGetReview(id: string) {
  await requireAdmin();

  const review = await prisma.courseReview.findUnique({
    where: { id },
    select: {
      id: true,
      rating: true,
      comment: true,
      isEdited: true,
      createdAt: true,
      updatedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return review;
}
