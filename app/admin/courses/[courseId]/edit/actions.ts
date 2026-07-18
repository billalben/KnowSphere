"use server";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { type CourseSchemaType, courseSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

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

export async function updateCourse(courseId: string, values: CourseSchemaType) {
  const session = await requireAdmin(); // checks if the user is an admin, if not, it will redirect to the login page

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests", null);
    }

    const validatedData = courseSchema.safeParse(values);

    if (!validatedData.success) {
      return errorResponse("Invalid data", z.treeifyError(validatedData.error));
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: validatedData.data,
    });

    return successResponse("Course updated successfully", course);
  } catch {
    return errorResponse("Failed to update course", null);
  }
}

interface iReorderLessonsProps {
  courseId: string;
  lessons: { id: string; position: number }[];
  chapterId: string;
}

export async function reorderLessons({
  courseId,
  lessons,
  chapterId,
}: iReorderLessonsProps) {
  try {
    if (!lessons || lessons.length === 0) {
      return errorResponse("No lessons provided", null);
    }

    if (!chapterId) {
      return errorResponse("Chapter ID is required", null);
    }

    await requireAdmin(); // checks if the user is an admin, if not, it will redirect to the login page

    // Two-step update to avoid unique constraint violations on (chapterId, position):
    // first move every row to a temporary negative position, then set final positions.
    const tempUpdates = lessons.map((lesson, index) =>
      prisma.lesson.update({
        where: { id: lesson.id, chapterId },
        data: { position: -(index + 1) },
      }),
    );
    const finalUpdates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: { id: lesson.id, chapterId },
        data: { position: lesson.position },
      }),
    );

    await prisma.$transaction([...tempUpdates, ...finalUpdates]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return successResponse("Lessons reordered successfully", finalUpdates);
  } catch {
    return errorResponse("Failed to reorder lessons", null);
  }
}

interface iReorderChaptersProps {
  courseId: string;
  chapters: { id: string; position: number }[];
}

export async function reorderChapters({
  courseId,
  chapters,
}: iReorderChaptersProps) {
  try {
    if (!chapters || chapters.length === 0) {
      return errorResponse("No chapters provided", null);
    }

    if (!courseId) {
      return errorResponse("Course ID is required", null);
    }

    await requireAdmin(); // checks if the user is an admin, if not, it will redirect to the login page

    // Two-step update to avoid unique constraint violations on (courseId, position):
    // first move every row to a temporary negative position, then set final positions.
    const tempUpdates = chapters.map((chapter, index) =>
      prisma.courseChapter.update({
        where: { id: chapter.id, courseId },
        data: { position: -(index + 1) },
      }),
    );
    const finalUpdates = chapters.map((chapter) =>
      prisma.courseChapter.update({
        where: { id: chapter.id, courseId },
        data: { position: chapter.position },
      }),
    );

    await prisma.$transaction([...tempUpdates, ...finalUpdates]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return successResponse("Chapters reordered successfully", finalUpdates);
  } catch {
    return errorResponse("Failed to reorder chapters", null);
  }
}
