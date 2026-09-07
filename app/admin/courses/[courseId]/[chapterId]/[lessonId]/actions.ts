"use server";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import {
  type LessonQuizSchemaType,
  type LessonSchemaType,
  lessonQuizSchema,
  lessonSchema,
} from "@/lib/zodSchemas";
import { z } from "zod";
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
      max: 10,
    }),
  );

const quizAj = arcjet
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
      max: 20,
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
      },
    });

    if (validatedData.data.videoKey) {
      await prisma.pendingUpload
        .delete({ where: { key: validatedData.data.videoKey } })
        .catch(() => {});
    }

    await adminLog({
      action: "LESSON_UPDATED",
      entityType: "LESSON",
      entityId: lesson.id,
      entityLabel: lesson.title,
      metadata: {
        courseId: validatedData.data.courseId,
        chapterId: validatedData.data.chapterId,
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

async function findLessonContext(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      chapterId: true,
      chapter: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  return {
    courseId: lesson.chapter.courseId,
    chapterId: lesson.chapterId,
    lessonTitle: lesson.title,
  };
}

export async function upsertLessonQuiz(
  lessonId: string,
  values: Omit<LessonQuizSchemaType, "lessonId">,
) {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await quizAj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests", null);
    }

    const parsed = lessonQuizSchema.safeParse({
      lessonId,
      ...values,
    });

    if (!parsed.success) {
      return errorResponse("Invalid data", z.treeifyError(parsed.error));
    }

    const ctx = await findLessonContext(lessonId);
    if (!ctx) {
      return errorResponse("Lesson not found", null);
    }

    const { questions } = parsed.data;

    const existingQuiz = await prisma.quiz.findUnique({
      where: { lessonId },
      select: { id: true },
    });
    const wasCreated = !existingQuiz;

    await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.upsert({
        where: { lessonId },
        update: {},
        create: { lessonId },
        select: { id: true },
      });

      // Delete-and-reinsert keeps the authoring flow simple and bounded;
      // questions and answers are a small, fully admin-owned dataset where
      // diffing would add complexity without saving meaningful work.
      await tx.quizQuestion.deleteMany({
        where: { quizId: quiz.id },
      });

      for (let qIndex = 0; qIndex < questions.length; qIndex++) {
        const question = questions[qIndex];
        if (!question) continue;

        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            text: question.text,
            type: question.type,
            position: qIndex,
            answers: {
              create: question.answers.map((answer, aIndex) => ({
                text: answer.text,
                isCorrect: answer.isCorrect,
                explanation: answer.explanation ?? null,
                position: aIndex,
              })),
            },
          },
        });
      }

      await adminLog(
        {
          action: wasCreated ? "QUIZ_CREATED" : "QUIZ_UPDATED",
          entityType: "QUIZ",
          entityId: quiz.id,
          entityLabel: ctx.lessonTitle
            ? `Quiz: ${ctx.lessonTitle}`
            : null,
          metadata: {
            courseId: ctx.courseId,
            chapterId: ctx.chapterId,
            lessonId,
            questionsCount: questions.length,
          },
        },
        tx,
      );
    });

    revalidatePath(
      `/admin/courses/${ctx.courseId}/${ctx.chapterId}/${lessonId}`,
    );

    return successResponse("Quiz saved successfully", null);
  } catch {
    return errorResponse("Failed to save quiz", null);
  }
}

const reorderQuizQuestionsSchema = z.object({
  lessonId: z.string().cuid(),
  questions: z.array(
    z.object({
      id: z.string().cuid(),
      position: z.number().int().min(0),
    }),
  ),
});

interface iReorderQuizQuestionsProps {
  lessonId: string;
  questions: { id: string; position: number }[];
}

export async function reorderQuizQuestions({
  lessonId,
  questions,
}: iReorderQuizQuestionsProps) {
  try {
    const parsed = reorderQuizQuestionsSchema.safeParse({
      lessonId,
      questions,
    });

    if (!parsed.success) {
      return errorResponse("Invalid data", z.treeifyError(parsed.error));
    }

    await requireAdmin();

    const ctx = await findLessonContext(lessonId);
    if (!ctx) {
      return errorResponse("Lesson not found", null);
    }

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      select: { id: true },
    });

    if (!quiz) {
      return errorResponse("Quiz not found", null);
    }

    const questionIds = parsed.data.questions.map((q) => q.id);

    const ownedQuestions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds }, quizId: quiz.id },
      select: { id: true },
    });

    if (ownedQuestions.length !== questionIds.length) {
      return errorResponse("One or more questions do not belong to this quiz", null);
    }

    // Two-step update to avoid @@unique([quizId, position]) violations:
    // first move every row to a temporary negative position, then set final.
    const tempUpdates = parsed.data.questions.map((question, index) =>
      prisma.quizQuestion.update({
        where: { id: question.id },
        data: { position: -(index + 1) },
      }),
    );
    const finalUpdates = parsed.data.questions.map((question) =>
      prisma.quizQuestion.update({
        where: { id: question.id },
        data: { position: question.position },
      }),
    );

    await prisma.$transaction([...tempUpdates, ...finalUpdates]);

    revalidatePath(
      `/admin/courses/${ctx.courseId}/${ctx.chapterId}/${lessonId}`,
    );

    return successResponse("Questions reordered successfully", null);
  } catch {
    return errorResponse("Failed to reorder questions", null);
  }
}
