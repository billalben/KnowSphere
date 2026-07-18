"use server";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import {
  ChapterSchemaType,
  type CourseSchemaType,
  LessonSchemaType,
  chapterSchema,
  courseSchema,
  lessonSchema,
} from "@/lib/zodSchemas";
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

export async function createChapter(values: ChapterSchemaType) {
  await requireAdmin(); // checks if the user is an admin, if not, it will redirect to the login page

  try {
    const validatedData = chapterSchema.safeParse(values);

    if (!validatedData.success) {
      return errorResponse("Invalid data", z.treeifyError(validatedData.error));
    }

    await prisma.$transaction(async (tx) => {
      const maxPosition = await tx.courseChapter.findFirst({
        where: { courseId: validatedData.data.courseId },
        select: { position: true },
        orderBy: { position: "desc" },
      });

      await tx.courseChapter.create({
        data: {
          title: validatedData.data.name,
          position: (maxPosition?.position ?? 0) + 1,
          courseId: validatedData.data.courseId,
        },
      });
    });

    revalidatePath(`/admin/courses/${validatedData.data.courseId}/edit`);

    return successResponse("Chapter created successfully", null);
  } catch {
    return errorResponse("Failed to create chapter", null);
  }
}

export async function createLesson(values: LessonSchemaType) {
  await requireAdmin(); // checks if the user is an admin, if not, it will redirect to the login page

  try {
    const validatedData = lessonSchema.safeParse(values);

    if (!validatedData.success) {
      return errorResponse("Invalid data", z.treeifyError(validatedData.error));
    }

    await prisma.$transaction(async (tx) => {
      const maxPosition = await tx.lesson.findFirst({
        where: { chapterId: validatedData.data.chapterId },
        select: { position: true },
        orderBy: { position: "desc" },
      });

      await tx.lesson.create({
        data: {
          title: validatedData.data.name,
          description: validatedData.data.description,
          videoKey: validatedData.data.videoKey,
          thumbnailKey: validatedData.data.thumbnailKey,
          position: (maxPosition?.position ?? 0) + 1,
          chapterId: validatedData.data.chapterId,
        },
      });
    });

    revalidatePath(`/admin/courses/${validatedData.data.courseId}/edit`);

    return successResponse("Lesson created successfully", null);
  } catch {
    return errorResponse("Failed to create lesson", null);
  }
}

export async function deleteLesson({
  courseId,
  chapterId,
  lessonId,
}: {
  courseId: string;
  chapterId: string;
  lessonId: string;
}) {
  await requireAdmin(); // checks if the user is an admin, if not, it will redirect to the login page

  try {
    const chapterwithlessons = await prisma.courseChapter.findUnique({
      where: { id: chapterId },
      select: {
        lessons: {
          orderBy: { position: "asc" },
          select: { id: true, position: true },
        },
      },
    });

    if (!chapterwithlessons) {
      return errorResponse("Chapter not found", null);
    }

    const lessons = chapterwithlessons.lessons;

    if (lessons.length === 0) {
      return errorResponse("No lessons found", null);
    }

    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);
    if (!lessonToDelete) {
      return errorResponse("Lesson not found", null);
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    const updates = remainingLessons.map((lesson, index) =>
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { position: index + 1 },
      }),
    );

    await prisma.$transaction([
      ...updates,
      prisma.lesson.delete({ where: { id: lessonId, chapterId } }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return successResponse("Lesson deleted successfully", null);
  } catch {
    return errorResponse("Failed to delete lesson", null);
  }
}

export async function deleteChapter({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}) {
  await requireAdmin(); // checks if the user is an admin, if not, it will redirect to the login page

  try {
    const courseWithChapters = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        courseChapters: {
          orderBy: { position: "asc" },
          select: { id: true, position: true },
        },
      },
    });

    if (!courseWithChapters) {
      return errorResponse("Course chapters not found", null);
    }

    const chapters = courseWithChapters.courseChapters;

    if (chapters.length === 0) {
      return errorResponse("No lessons found", null);
    }

    const chapterToDelete = chapters.find(
      (chapter) => chapter.id === chapterId,
    );
    if (!chapterToDelete) {
      return errorResponse("Chapter not found", null);
    }

    const remainingChapters = chapters.filter(
      (chapter) => chapter.id !== chapterId,
    );

    const updates = remainingChapters.map((chapter, index) =>
      prisma.courseChapter.update({
        where: { id: chapter.id },
        data: { position: index + 1 },
      }),
    );

    await prisma.$transaction([
      ...updates,
      prisma.courseChapter.delete({ where: { id: chapterId } }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return successResponse("Chapter deleted successfully", null);
  } catch {
    return errorResponse("Failed to delete chapter", null);
  }
}
