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

  return course;
}
