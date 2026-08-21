import "server-only";

import prisma from "@/lib/prisma";
import { requireUser } from "./require-user";

export type tEnrolledCourse = {
  enrollmentId: string;
  id: string;
  slug: string;
  title: string;
  smallDesc: string;
  fileKey: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number;
  chaptersCount: number;
  lessonsCount: number;
  firstLessonId: string | null;
};

export async function getMyEnrolledCourses(): Promise<tEnrolledCourse[]> {
  const session = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
      status: "Active",
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          smallDesc: true,
          fileKey: true,
          level: true,
          duration: true,
          courseChapters: {
            orderBy: { position: "asc" },
            select: {
              lessons: {
                orderBy: { position: "asc" },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  return enrollments.map((enrollment) => {
    const chapters = enrollment.course.courseChapters;
    const lessonsCount = chapters.reduce(
      (acc, chapter) => acc + chapter.lessons.length,
      0,
    );
    const firstLessonId = chapters[0]?.lessons[0]?.id ?? null;

    return {
      enrollmentId: enrollment.id,
      id: enrollment.course.id,
      slug: enrollment.course.slug,
      title: enrollment.course.title,
      smallDesc: enrollment.course.smallDesc,
      fileKey: enrollment.course.fileKey,
      level: enrollment.course.level,
      duration: enrollment.course.duration,
      chaptersCount: chapters.length,
      lessonsCount,
      firstLessonId,
    };
  });
}
