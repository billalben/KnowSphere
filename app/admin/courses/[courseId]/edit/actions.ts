"use server";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { type CourseSchemaType, courseSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

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

export async function updateCourse(
  courseId: string,
  values: CourseSchemaType,
) {
  const session = await requireAdmin();

  if (!session?.user?.id) {
    return errorResponse("Unauthorized", null);
  }

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