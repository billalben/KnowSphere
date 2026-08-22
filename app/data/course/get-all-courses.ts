import "server-only";

import prisma from "@/lib/prisma";

export async function getAllCourses() {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      smallDesc: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      courseChapters: {
        select: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
      courseReviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
  });

  return courses.map((course) => {
    const ratings = course.courseReviews;
    const reviewCount = ratings.length;
    const reviewAvg =
      reviewCount === 0
        ? 0
        : ratings.reduce((acc, r) => acc + r.rating, 0) / reviewCount;

    return {
      id: course.id,
      title: course.title,
      smallDesc: course.smallDesc,
      duration: course.duration,
      level: course.level,
      status: course.status,
      price: course.price,
      fileKey: course.fileKey,
      slug: course.slug,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.courseChapters.reduce(
        (acc, chapter) => acc + chapter.lessons.length,
        0,
      ),
      chaptersCount: course.courseChapters.length,
      reviewAvg,
      reviewCount,
    };
  });
}

export type tCourse = Awaited<ReturnType<typeof getAllCourses>>[number];
