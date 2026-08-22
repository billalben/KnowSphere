"use server";

import { revalidatePath } from "next/cache";

import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { issueCertificateIfEligible } from "@/lib/certificates/issue-certificate-if-eligible";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { type tApiResponse } from "@/types/api";
import { requireUser } from "@/app/data/user/require-user";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 30,
  }),
);

interface SetLessonCompletionInput {
  lessonId: string;
  completed: boolean;
}

type SetLessonCompletionData = {
  certificateJustIssued: boolean;
  verificationCode: string | null;
};

export async function setLessonCompletionAction({
  lessonId,
  completed,
}: SetLessonCompletionInput): Promise<tApiResponse<SetLessonCompletionData>> {
  const session = await requireUser();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests. Please try again later.", {
        certificateJustIssued: false,
        verificationCode: null,
      });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        chapter: {
          select: {
            course: {
              select: { id: true, slug: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      return errorResponse("Lesson not found", {
        certificateJustIssued: false,
        verificationCode: null,
      });
    }

    const { id: courseId, slug } = lesson.chapter.course;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
      select: { status: true },
    });

    if (!enrollment || enrollment.status !== "Active") {
      return errorResponse("You are not enrolled in this course", {
        certificateJustIssued: false,
        verificationCode: null,
      });
    }

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      create: {
        userId: session.user.id,
        lessonId,
        completed,
      },
      update: {
        completed,
      },
    });

    let certificateJustIssued = false;
    let verificationCode: string | null = null;

    if (completed) {
      const result = await issueCertificateIfEligible({
        userId: session.user.id,
        courseId,
      });

      if (result.issued) {
        certificateJustIssued = true;
        verificationCode = result.verificationCode;
      }
    }

    revalidatePath(`/dashboard/courses/${slug}/${lessonId}`);
    revalidatePath(`/dashboard/courses/${slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/certificates");

    return successResponse(
      completed ? "Lesson marked as completed" : "Lesson marked as incomplete",
      { certificateJustIssued, verificationCode },
    );
  } catch {
    return errorResponse("Failed to update progress", {
      certificateJustIssued: false,
      verificationCode: null,
    });
  }
}
