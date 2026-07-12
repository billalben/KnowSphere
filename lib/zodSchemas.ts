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
    .max(500, "Description must be at most 500 characters long")
    .optional(),
  smallDesc: z
    .string()
    .max(100, "Small description must be at most 100 characters long"),
  fileKey: z.string().min(1, "File key is required"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  level: z.enum(ECourseLevel).default(ECourseLevel.BEGINNER),
  status: z.enum(ECourseStatus).default(ECourseStatus.DRAFT),
  slug: z
    .string()
    .min(5, "Slug must be at least 5 characters long")
    .max(50, "Slug must be at most 50 characters long"),
  category: z.string().min(3, "Category must be at least 3 characters long"),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
