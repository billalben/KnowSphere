"use server";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { type CourseSchemaType, courseSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { stripe } from "@/lib/stripe";
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

export async function createCourse(values: CourseSchemaType) {
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

    const data = await stripe.products.create({
      name: validatedData.data.title,
      description: validatedData.data.smallDesc,
      default_price_data: {
        currency: "usd",
        unit_amount: validatedData.data.price * 100,
      },
    });

    const course = await prisma.course.create({
      data: {
        ...validatedData.data,
        userId: session.user.id,
        stripePriceId: String(data.default_price),
      },
    });

    await adminLog({
      action: "COURSE_CREATED",
      entityType: "COURSE",
      entityId: course.id,
      entityLabel: course.title,
      metadata: { status: course.status, level: course.level, price: course.price },
    });

    return successResponse("Course created successfully", course);
  } catch {
    return errorResponse("Failed to create course", null);
  }
}
