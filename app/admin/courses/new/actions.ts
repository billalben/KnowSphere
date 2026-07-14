"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { type CourseSchemaType, courseSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { headers } from "next/headers";

export async function createCourse(values: CourseSchemaType) {
  try {
    const validatedData = courseSchema.safeParse(values);

    if (!validatedData.success) {
      return errorResponse("Invalid data", z.treeifyError(validatedData.error));
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return errorResponse("Unauthorized", null);
    }

    const course = await prisma.course.create({
      data: {
        ...validatedData.data,
        userId: session.user.id,
      },
    });

    return successResponse("Course created successfully", course);
  } catch {
    return errorResponse("Failed to create course", null);
  }
}
