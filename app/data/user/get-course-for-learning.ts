import "server-only";

import { notFound, redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireUser } from "./require-user";

export type tCourseForLearningLesson = {
  id: string;
  title: string;
  description: string | null;
  videoKey: string | null;
  thumbnailKey: string | null;
  position: number;
  completed: boolean;
};

export type tCourseForLearningChapter = {
  id: string;
  title: string;
  position: number;
  lessons: tCourseForLearningLesson[];
};

export type tCourseForLearning = {
  id: string;
  title: string;
  slug: string;
  smallDesc: string;
  fileKey: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  courseChapters: tCourseForLearningChapter[];
};

export async function getCourseForLearning({
  slug,
}: {
  slug: string;
}): Promise<tCourseForLearning> {
  const session = await requireUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      smallDesc: true,
      fileKey: true,
      status: true,
      courseChapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              videoKey: true,
              thumbnailKey: true,
              position: true,
              lessonProgress: {
                where: { userId: session.user.id },
                select: { completed: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "Active") {
    redirect(`/courses/${slug}`);
  }

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    smallDesc: course.smallDesc,
    fileKey: course.fileKey,
    status: course.status,
    courseChapters: course.courseChapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      position: chapter.position,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoKey: lesson.videoKey,
        thumbnailKey: lesson.thumbnailKey,
        position: lesson.position,
        completed: lesson.lessonProgress[0]?.completed ?? false,
      })),
    })),
  };
}
