"use server";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { type LessonSchemaType, lessonSchema } from "@/lib/zodSchemas";
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
      max: 10,
    }),
  );

export async function updateLesson(lessonId: string, values: LessonSchemaType) {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests", null);
    }

    const validatedData = lessonSchema.safeParse(values);

    if (!validatedData.success) {
      return errorResponse("Invalid data", z.treeifyError(validatedData.error));
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: validatedData.data.name,
        description: validatedData.data.description ?? null,
        videoKey: validatedData.data.videoKey ?? null,
        thumbnailKey: validatedData.data.thumbnailKey ?? null,
      },
    });

    revalidatePath(
      `/admin/courses/${validatedData.data.courseId}/${validatedData.data.chapterId}/${lessonId}`,
    );
    revalidatePath(`/admin/courses/${validatedData.data.courseId}/edit`);

    return successResponse("Lesson updated successfully", lesson);
  } catch {
    return errorResponse("Failed to update lesson", null);
  }
}
