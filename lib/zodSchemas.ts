import { z } from "zod";

export enum ECourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum ECourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export const courseSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(32, "Title must be at most 32 characters long"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters long")
    .optional(),
  smallDesc: z
    .string()
    .max(100, "Small description must be at most 100 characters long"),
  fileKey: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  level: z.enum(ECourseLevel).default(ECourseLevel.BEGINNER),
  status: z.enum(ECourseStatus).default(ECourseStatus.DRAFT),
  slug: z
    .string()
    .min(5, "Slug must be at least 5 characters long")
    .max(50, "Slug must be at most 50 characters long"),
  categories: z
    .array(z.string().min(2).max(50))
    .max(10, "A course can have at most 10 categories")
    .default([]),
});

export const chapterSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  courseId: z.cuid({ message: "Invalid course ID" }),
});

export const lessonSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  courseId: z.cuid({ message: "Invalid course ID" }),
  chapterId: z.cuid({ message: "Invalid chapter ID" }),

  description: z
    .string()
    .min(3, "Description must be at least 3 characters long")
    .optional(),

  videoKey: z.string().optional().nullable(),
  thumbnailKey: z.string().optional().nullable(),
});

export enum EQuizQuestionType {
  SINGLE = "SINGLE",
  MULTIPLE = "MULTIPLE",
}

export const quizQuestionTypeSchema = z.enum([
  EQuizQuestionType.SINGLE,
  EQuizQuestionType.MULTIPLE,
]);

export const quizAnswerInputSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .min(1, "Answer text is required")
    .max(500, "Answer text must be at most 500 characters long"),
  isCorrect: z.boolean(),
  explanation: z
    .string()
    .max(1000, "Explanation must be at most 1000 characters long")
    .optional(),
});

export const quizQuestionInputSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .min(3, "Question text must be at least 3 characters long")
    .max(1000, "Question text must be at most 1000 characters long"),
  type: quizQuestionTypeSchema,
  answers: z
    .array(quizAnswerInputSchema)
    .min(2, "At least 2 answers required")
    .superRefine((arr, ctx) => {
      const correctCount = arr.filter((a) => a.isCorrect).length;
      if (correctCount === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Mark at least one correct answer",
        });
      }
    }),
});

export const lessonQuizSchema = z.object({
  lessonId: z.cuid({ message: "Invalid lesson ID" }),
  questions: z
    .array(quizQuestionInputSchema)
    .min(1, "At least one question is required"),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
export type QuizQuestionTypeSchemaType = z.infer<typeof quizQuestionTypeSchema>;
export type QuizAnswerInputSchemaType = z.infer<typeof quizAnswerInputSchema>;
export type QuizQuestionInputSchemaType = z.infer<
  typeof quizQuestionInputSchema
>;
export type LessonQuizSchemaType = z.infer<typeof lessonQuizSchema>;

export const categoryNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(
    /^[a-zA-Z0-9 &+\-]+$/,
    "Only letters, numbers, spaces and &+- are allowed",
  );

export const categorySchema = z.object({
  name: categoryNameSchema,
});
export type CategorySchemaType = z.infer<typeof categorySchema>;
