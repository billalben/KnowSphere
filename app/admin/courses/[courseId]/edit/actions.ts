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
import { adminLog } from "@/lib/activity/admin-log";
import {
  CATEGORY_LIMIT_EXCEEDED,
  resolveCategories,
} from "@/app/data/course/resolve-categories";

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

    const { categories: categoryNames, ...courseFields } = validatedData.data;

    const before = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
        status: true,
        price: true,
        level: true,
        slug: true,
        categories: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });

    let course;
    try {
      course = await prisma.$transaction(async (tx) => {
        const categories = await resolveCategories(categoryNames, tx);

        return tx.course.update({
          where: { id: courseId },
          data: {
            ...courseFields,
            categories: {
              set: categories.map((c) => ({ id: c.id })),
            },
          },
        });
      });
    } catch (err) {
      if (err instanceof CATEGORY_LIMIT_EXCEEDED) {
        return errorResponse(err.message, null);
      }
      throw err;
    }

    if (before) {
      const statusChanged = before.status !== course.status;
      const changedFields: Record<string, { from: unknown; to: unknown }> = {};
      if (before.price !== course.price)
        changedFields.price = { from: before.price, to: course.price };
      if (before.level !== course.level)
        changedFields.level = { from: before.level, to: course.level };

      const beforeNames = before.categories.map((c) => c.name);
      const categoriesChanged =
        beforeNames.length !== categoryNames.length ||
        beforeNames.some((name, idx) => name !== categoryNames[idx]);
      if (categoriesChanged) {
        changedFields.categories = { from: beforeNames, to: categoryNames };
      }

      if (statusChanged) {
        await adminLog({
          action: "COURSE_STATUS_CHANGED",
          entityType: "COURSE",
          entityId: course.id,
          entityLabel: course.title,
          metadata: {
            from: before.status,
            to: course.status,
            ...(Object.keys(changedFields).length > 0 ? { fields: changedFields } : {}),
          },
        });
      } else {
        await adminLog({
          action: "COURSE_UPDATED",
          entityType: "COURSE",
          entityId: course.id,
          entityLabel: course.title,
          metadata:
            Object.keys(changedFields).length > 0
              ? { fields: changedFields }
              : null,
        });
      }
    }

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

      const created = await tx.courseChapter.create({
        data: {
          title: validatedData.data.name,
          position: (maxPosition?.position ?? 0) + 1,
          courseId: validatedData.data.courseId,
        },
        select: { id: true, title: true },
      });

      await adminLog(
        {
          action: "CHAPTER_CREATED",
          entityType: "CHAPTER",
          entityId: created.id,
          entityLabel: created.title,
          metadata: {
            courseId: validatedData.data.courseId,
            position: (maxPosition?.position ?? 0) + 1,
          },
        },
        tx,
      );
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

      const created = await tx.lesson.create({
        data: {
          title: validatedData.data.name,
          description: validatedData.data.description,
          videoKey: validatedData.data.videoKey,
          thumbnailKey: validatedData.data.thumbnailKey,
          position: (maxPosition?.position ?? 0) + 1,
          chapterId: validatedData.data.chapterId,
        },
        select: { id: true, title: true },
      });

      await adminLog(
        {
          action: "LESSON_CREATED",
          entityType: "LESSON",
          entityId: created.id,
          entityLabel: created.title,
          metadata: {
            courseId: validatedData.data.courseId,
            chapterId: validatedData.data.chapterId,
          },
        },
        tx,
      );
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
          select: { id: true, position: true, title: true },
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

    // Two-step reposition to avoid @@unique([chapterId, position]) violations:
    // move remaining lessons to temporary negative positions, delete the target,
    // then set final positions. Order matters — the deleted lesson keeps its
    // position until the delete runs, so direct repositioning would clash.
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        remainingLessons.map((lesson, index) =>
          tx.lesson.update({
            where: { id: lesson.id },
            data: { position: -(index + 1) },
          }),
        ),
      );

      await tx.lesson.delete({ where: { id: lessonId } });

      await Promise.all(
        remainingLessons.map((lesson, index) =>
          tx.lesson.update({
            where: { id: lesson.id },
            data: { position: index + 1 },
          }),
        ),
      );

      await adminLog(
        {
          action: "LESSON_DELETED",
          entityType: "LESSON",
          entityId: lessonId,
          entityLabel: lessonToDelete.title,
          metadata: { courseId, chapterId },
        },
        tx,
      );
    });

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
          select: { id: true, position: true, title: true },
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

    // Two-step reposition to avoid @@unique([courseId, position]) violations:
    // move remaining chapters to temporary negative positions, delete the
    // target, then set final positions. Without temp moves, sequential updates
    // would clash with the not-yet-deleted chapter's position (and with each
    // other mid-transaction), throwing inside $transaction.
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        remainingChapters.map((chapter, index) =>
          tx.courseChapter.update({
            where: { id: chapter.id },
            data: { position: -(index + 1) },
          }),
        ),
      );

      await tx.courseChapter.delete({ where: { id: chapterId } });

      await Promise.all(
        remainingChapters.map((chapter, index) =>
          tx.courseChapter.update({
            where: { id: chapter.id },
            data: { position: index + 1 },
          }),
        ),
      );

      await adminLog(
        {
          action: "CHAPTER_DELETED",
          entityType: "CHAPTER",
          entityId: chapterId,
          entityLabel: chapterToDelete.title,
          metadata: { courseId },
        },
        tx,
      );
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return successResponse("Chapter deleted successfully", null);
  } catch {
    return errorResponse("Failed to delete chapter", null);
  }
}
