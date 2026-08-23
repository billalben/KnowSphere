import type {
  ActivityAction,
  ActivityEntityType,
} from "@/lib/generated/prisma/client";

export const ACTIVITY_ACTIONS = [
  "all",
  "COURSE_CREATED",
  "COURSE_UPDATED",
  "COURSE_STATUS_CHANGED",
  "COURSE_DELETED",
  "CHAPTER_CREATED",
  "CHAPTER_UPDATED",
  "CHAPTER_DELETED",
  "LESSON_CREATED",
  "LESSON_UPDATED",
  "LESSON_DELETED",
  "QUIZ_CREATED",
  "QUIZ_UPDATED",
  "REVIEW_DELETED",
  "CONTACT_MESSAGE_DELETED",
] as const;

export const ENTITY_TYPES = [
  "all",
  "COURSE",
  "CHAPTER",
  "LESSON",
  "QUIZ",
  "REVIEW",
  "CONTACT_MESSAGE",
] as const;

export type ActionFilter = (typeof ACTIVITY_ACTIONS)[number];
export type EntityFilter = (typeof ENTITY_TYPES)[number];

export function parseActionParam(
  value: string | undefined,
): ActivityAction | null {
  if (!value || value === "all") return null;
  return (ACTIVITY_ACTIONS as readonly string[]).includes(value)
    ? (value as ActivityAction)
    : null;
}

export function parseEntityParam(
  value: string | undefined,
): ActivityEntityType | null {
  if (!value || value === "all") return null;
  return (ENTITY_TYPES as readonly string[]).includes(value)
    ? (value as ActivityEntityType)
    : null;
}