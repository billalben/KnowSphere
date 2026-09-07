import { z } from "zod";

import type { ActivityAction } from "@/lib/generated/prisma/client";

const fieldChangeValueSchema = z.union([
  z.object({ from: z.unknown(), to: z.unknown() }),
  z.object({
    fromLength: z.number().int().nonnegative(),
    toLength: z.number().int().nonnegative(),
  }),
  z.object({
    added: z.array(z.unknown()),
    removed: z.array(z.unknown()),
  }),
]);

const fieldsMapSchema = z.record(z.string(), fieldChangeValueSchema);

export const courseStatusChangedMetadataSchema = z.object({
  from: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  to: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  fields: fieldsMapSchema.optional(),
});

export const courseUpdatedMetadataSchema = z.object({
  fields: fieldsMapSchema,
});

export const courseParentContextSchema = z.object({
  courseId: z.string(),
});

export const lessonParentContextSchema = z.object({
  courseId: z.string(),
  chapterId: z.string(),
});

export const lessonUpdatedMetadataSchema = z.object({
  courseId: z.string(),
  chapterId: z.string(),
  fields: fieldsMapSchema,
});

export const quizCreatedMetadataSchema = z.object({
  courseId: z.string(),
  chapterId: z.string(),
  lessonId: z.string(),
  fields: fieldsMapSchema.optional(),
  questionsCount: z.number().int().nonnegative().optional(),
});

export const quizUpdatedMetadataSchema = z.object({
  courseId: z.string(),
  chapterId: z.string(),
  lessonId: z.string(),
  fields: fieldsMapSchema,
});

export const categoryUpdatedMetadataSchema = z.object({
  fields: fieldsMapSchema,
});

export const ACTIVITY_METADATA_SCHEMAS: Partial<
  Record<ActivityAction, z.ZodTypeAny>
> = {
  COURSE_UPDATED: courseUpdatedMetadataSchema,
  COURSE_STATUS_CHANGED: courseStatusChangedMetadataSchema,
  LESSON_UPDATED: lessonUpdatedMetadataSchema,
  QUIZ_UPDATED: quizUpdatedMetadataSchema,
  QUIZ_CREATED: quizCreatedMetadataSchema,
  CATEGORY_UPDATED: categoryUpdatedMetadataSchema,
};

export function parseActivityMetadata(
  action: ActivityAction,
  metadata: unknown,
): { ok: true; value: unknown } | { ok: false; error: z.ZodError } {
  const schema = ACTIVITY_METADATA_SCHEMAS[action];
  if (!schema) return { ok: true, value: metadata };
  const result = schema.safeParse(metadata);
  if (!result.success) return { ok: false, error: result.error };
  return { ok: true, value: result.data };
}
