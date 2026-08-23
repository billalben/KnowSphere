"use server";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { adminLog } from "@/lib/activity/admin-log";

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

export async function deleteCourse({ courseId }: { courseId: string }) {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests", null);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, slug: true },
    });

    if (!course) {
      return errorResponse("Course not found", null);
    }

    // CourseChapter and Lesson cascade on delete from the schema, so deleting
    // the course removes its chapters and lessons in the same transaction.
    await prisma.course.delete({
      where: { id: courseId },
    });

    await adminLog({
      action: "COURSE_DELETED",
      entityType: "COURSE",
      entityId: course.id,
      entityLabel: course.title,
      metadata: { slug: course.slug },
    });

    revalidatePath("/admin/courses");

    return successResponse("Course deleted successfully", null);
  } catch {
    return errorResponse("Failed to delete course", null);
  }
}
