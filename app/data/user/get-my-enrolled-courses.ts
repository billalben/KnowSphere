import "server-only";

import prisma from "@/lib/prisma";
import { requireUser } from "./require-user";

export type tEnrolledCourse = {
  enrollmentId: string;
  id: string;
  slug: string;
  title: string;
  smallDesc: string;
  fileKey: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number;
  chaptersCount: number;
  lessonsCount: number;
  completedCount: number;
  resumeLessonId: string | null;
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
                select: {
                  id: true,
                  lessonProgress: {
                    where: { userId: session.user.id },
                    select: { completed: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return enrollments.map((enrollment) => {
    const chapters = enrollment.course.courseChapters;
    const lessons = chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({
        id: lesson.id,
        completed: lesson.lessonProgress[0]?.completed ?? false,
      })),
    );
    const lessonsCount = lessons.length;
    const completedCount = lessons.filter((lesson) => lesson.completed).length;
    const resumeLessonId =
      lessons.find((lesson) => !lesson.completed)?.id ?? lessons[0]?.id ?? null;

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
      completedCount,
      resumeLessonId,
    };
  });
}
