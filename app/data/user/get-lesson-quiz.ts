import "server-only";

import prisma from "@/lib/prisma";
import { requireUser } from "./require-user";

export type tUserQuizAnswer = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
};

export type tUserQuizQuestion = {
  id: string;
  text: string;
  type: "SINGLE" | "MULTIPLE";
  answers: tUserQuizAnswer[];
};

export type tUserLessonQuiz = {
  id: string;
  questions: tUserQuizQuestion[];
};

type TGetLessonQuizForUserProps = {
  lessonId: string;
};

export async function getLessonQuizForUser({
  lessonId,
}: TGetLessonQuizForUserProps): Promise<tUserLessonQuiz | null> {
  await requireUser();

  // The dashboard page calls getCourseForLearning first which enforces
  // course-published + active enrollment (redirects on miss). This fetcher
  // runs only after those gates pass, so we don't re-check them here.
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    select: {
      id: true,
      questions: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          text: true,
          type: true,
          answers: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              text: true,
              isCorrect: true,
              explanation: true,
            },
          },
        },
      },
    },
  });

  if (!quiz || quiz.questions.length === 0) {
    return null;
  }

  return {
    id: quiz.id,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        explanation: a.explanation,
      })),
    })),
  };
}
