import "server-only";

import prisma from "@/lib/prisma";

export type tCourseReviewsPage = {
  items: Array<{
    id: string;
    rating: number;
    comment: string;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      image: string | null;
      role: string | null;
    };
  }>;
  total: number;
  page: number;
  pageSize: number;
};

export async function getCourseReviews({
  courseId,
  page = 1,
  pageSize = 10,
}: {
  courseId: string;
  page?: number;
  pageSize?: number;
}): Promise<tCourseReviewsPage> {
  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.courseReview.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        rating: true,
        comment: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    }),
    prisma.courseReview.count({ where: { courseId } }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      isEdited: row.isEdited,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.user.id,
        name: row.user.name,
        image: row.user.image,
        role: row.user.role,
      },
    })),
    total,
    page,
    pageSize,
  };
}

export async function getCourseRatingAggregate({
  courseId,
}: {
  courseId: string;
}): Promise<{ avg: number; count: number }> {
  const result = await prisma.courseReview.aggregate({
    where: { courseId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return {
    avg: result._avg.rating ?? 0,
    count: result._count._all,
  };
}
