import "server-only";

import prisma from "@/lib/prisma";

import { requireUser } from "./require-user";

export type tWishlistCourse = {
  id: string;
  slug: string;
  title: string;
  smallDesc: string;
  duration: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price: number;
  fileKey: string;
  createdAt: Date;
  updatedAt: Date;
  lessonsCount: number;
  chaptersCount: number;
  reviewAvg: number;
  reviewCount: number;
  isEnrolled: boolean;
  wishlistItemId: string;
  savedAt: Date;
};

export type tWishlistPage = {
  items: tWishlistCourse[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getMyWishlistCourses({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}): Promise<tWishlistPage> {
  const session = await requireUser();
  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: {
        userId: session.user.id,
        course: { status: "PUBLISHED" },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            smallDesc: true,
            duration: true,
            level: true,
            status: true,
            price: true,
            fileKey: true,
            createdAt: true,
            updatedAt: true,
            courseChapters: {
              select: {
                lessons: { select: { id: true } },
              },
            },
            courseReviews: { select: { rating: true } },
            enrollment: {
              where: { userId: session.user.id, status: "Active" },
              select: { id: true },
            },
          },
        },
      },
    }),
    prisma.wishlistItem.count({
      where: {
        userId: session.user.id,
        course: { status: "PUBLISHED" },
      },
    }),
  ]);

  const items: tWishlistCourse[] = rows.map((row) => {
    const ratings = row.course.courseReviews;
    const reviewCount = ratings.length;
    const reviewAvg =
      reviewCount === 0
        ? 0
        : ratings.reduce((acc, r) => acc + r.rating, 0) / reviewCount;

    return {
      id: row.course.id,
      slug: row.course.slug,
      title: row.course.title,
      smallDesc: row.course.smallDesc,
      duration: row.course.duration,
      level: row.course.level,
      status: row.course.status,
      price: row.course.price,
      fileKey: row.course.fileKey,
      createdAt: row.course.createdAt,
      updatedAt: row.course.updatedAt,
      lessonsCount: row.course.courseChapters.reduce(
        (acc, chapter) => acc + chapter.lessons.length,
        0,
      ),
      chaptersCount: row.course.courseChapters.length,
      reviewAvg,
      reviewCount,
      isEnrolled: row.course.enrollment.length > 0,
      wishlistItemId: row.id,
      savedAt: row.createdAt,
    };
  });

  return { items, total, page, pageSize };
}
