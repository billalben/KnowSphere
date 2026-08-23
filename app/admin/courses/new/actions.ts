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

function toPlainText(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

    const { categories: categoryNames, ...courseFields } = validatedData.data;

    const stripeDescription =
      toPlainText(courseFields.description) ||
      courseFields.smallDesc.trim() ||
      undefined;

    const stripeProduct = await stripe.products.create({
      name: courseFields.title,
      ...(stripeDescription !== undefined && { description: stripeDescription }),
      default_price_data: {
        currency: "usd",
        unit_amount: courseFields.price * 100,
      },
    });

    let course;
    try {
      course = await prisma.$transaction(async (tx) => {
        const categories = await resolveCategories(categoryNames, tx);

        return tx.course.create({
          data: {
            ...courseFields,
            userId: session.user.id,
            stripePriceId: String(stripeProduct.default_price),
            categories: {
              connect: categories.map((c) => ({ id: c.id })),
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

    await adminLog({
      action: "COURSE_CREATED",
      entityType: "COURSE",
      entityId: course.id,
      entityLabel: course.title,
      metadata: {
        status: course.status,
        level: course.level,
        price: course.price,
        categories: categoryNames,
      },
    });

    return successResponse("Course created successfully", course);
  } catch (error) {
    console.error("Failed to create course: ", error);

    return errorResponse("Failed to create course", null);
  }
}
