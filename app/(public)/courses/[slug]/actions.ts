"use server";

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { stripe } from "@/lib/stripe";
import { type tApiResponse } from "@/types/api";
import { request } from "@arcjet/next";
import Stripe from "stripe";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 3,
  }),
);

type TEnrollInCourseAction = {
  courseId: string;
};

type EnrollData = {
  checkoutUrl: string | null;
  enrollmentStatus: "Active" | "Pending";
};

export async function enrollInCourseAction({
  courseId,
}: TEnrollInCourseAction): Promise<tApiResponse<EnrollData | null>> {
  const session = await requireUser();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("You have been blocked", null);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) return errorResponse("Course not found", null);

    const isFree = !course.price;

    // Cheap isolated read -- no transactional context needed alongside Stripe.
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
      select: { id: true, status: true },
    });

    if (existingEnrollment?.status === "Active") {
      return successResponse<EnrollData>(
        "You are already enrolled in this course",
        { checkoutUrl: null, enrollmentStatus: "Active" },
      );
    }

    if (isFree) {
      if (existingEnrollment) {
        await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { status: "Active", updatedAt: new Date() },
        });
      } else {
        await prisma.enrollment.create({
          data: {
            userId: session.user.id,
            courseId: course.id,
            amount: 0,
            status: "Active",
          },
        });
      }

      return successResponse<EnrollData>(
        "You are enrolled — enjoy the course!",
        { checkoutUrl: null, enrollmentStatus: "Active" },
      );
    }

    // Paid path: ensure a Stripe customer, then upsert Pending + create checkout.
    let stripeCustomerId: string;
    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: {
          userId: session.user.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId },
      });
    }

    const checkoutUrl = await prisma.$transaction(async (tx) => {
      const enrollment = existingEnrollment
        ? await tx.enrollment.update({
            where: { id: existingEnrollment.id },
            data: {
              amount: course.price,
              status: "Pending",
              updatedAt: new Date(),
            },
          })
        : await tx.enrollment.create({
            data: {
              userId: session.user.id,
              courseId: course.id,
              amount: course.price,
              status: "Pending",
            },
          });

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: "price_1U6I4BBQldwOCYMBTVYAxujq",
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: session.user.id,
          courseId: course.id,
          enrollmentId: enrollment.id,
        },
      });

      return checkoutSession.url;
    });

    if (!checkoutUrl) {
      return errorResponse(
        "Could not create a checkout session. Please try again.",
        null,
      );
    }

    return successResponse<EnrollData>(
      "Redirecting to checkout...",
      { checkoutUrl, enrollmentStatus: "Pending" },
    );
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return errorResponse("Payment system error, please try later", null);
    }
    return errorResponse("Failed to enroll in course", null);
  }
}