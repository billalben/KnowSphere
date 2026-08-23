import type { LucideIcon } from "lucide-react";
import {
  BookCheckIcon,
  BookOpenCheckIcon,
  BookOpenIcon,
  FileEditIcon,
  FilePlusIcon,
  FileXIcon,
  HelpCircleIcon,
  ListChecksIcon,
  MailXIcon,
  MessageCircleXIcon,
  PencilIcon,
  StarIcon,
  StarOffIcon,
  TagIcon,
} from "lucide-react";

import type { ActivityAction, ActivityEntityType } from "@/lib/generated/prisma/client";

export type ActivityTone = "neutral" | "positive" | "warning" | "destructive";

export type ActivityPresentation = {
  label: string;
  icon: LucideIcon;
  tone: ActivityTone;
};

export const ACTIVITY_PRESENTATION: Record<ActivityAction, ActivityPresentation> = {
  COURSE_CREATED: { label: "created course", icon: FilePlusIcon, tone: "positive" },
  COURSE_UPDATED: { label: "updated course", icon: PencilIcon, tone: "neutral" },
  COURSE_STATUS_CHANGED: { label: "changed course status", icon: BookOpenCheckIcon, tone: "warning" },
  COURSE_DELETED: { label: "deleted course", icon: FileXIcon, tone: "destructive" },

  CHAPTER_CREATED: { label: "created chapter", icon: FilePlusIcon, tone: "positive" },
  CHAPTER_UPDATED: { label: "updated chapter", icon: FileEditIcon, tone: "neutral" },
  CHAPTER_DELETED: { label: "deleted chapter", icon: FileXIcon, tone: "destructive" },

  LESSON_CREATED: { label: "created lesson", icon: FilePlusIcon, tone: "positive" },
  LESSON_UPDATED: { label: "updated lesson", icon: PencilIcon, tone: "neutral" },
  LESSON_DELETED: { label: "deleted lesson", icon: FileXIcon, tone: "destructive" },

  QUIZ_CREATED: { label: "created quiz", icon: ListChecksIcon, tone: "positive" },
  QUIZ_UPDATED: { label: "updated quiz", icon: ListChecksIcon, tone: "neutral" },

  REVIEW_DELETED: { label: "deleted review", icon: StarOffIcon, tone: "destructive" },
  CONTACT_MESSAGE_DELETED: { label: "deleted contact message", icon: MailXIcon, tone: "destructive" },

  CATEGORY_CREATED: { label: "created category", icon: FilePlusIcon, tone: "positive" },
  CATEGORY_UPDATED: { label: "updated category", icon: PencilIcon, tone: "neutral" },
  CATEGORY_DELETED: { label: "deleted category", icon: FileXIcon, tone: "destructive" },
};

export const ENTITY_PRESENTATION: Record<ActivityEntityType, { label: string; icon: LucideIcon }> = {
  COURSE: { label: "Course", icon: BookOpenIcon },
  CHAPTER: { label: "Chapter", icon: BookCheckIcon },
  LESSON: { label: "Lesson", icon: BookOpenIcon },
  QUIZ: { label: "Quiz", icon: HelpCircleIcon },
  REVIEW: { label: "Review", icon: StarIcon },
  CONTACT_MESSAGE: { label: "Contact message", icon: MessageCircleXIcon },
  CATEGORY: { label: "Category", icon: TagIcon },
};

export const ENTITY_HREF_PREFIX: Record<ActivityEntityType, string | null> = {
  COURSE: "/admin/courses",
  CHAPTER: "/admin/courses",
  LESSON: "/admin/courses",
  QUIZ: "/admin/courses",
  REVIEW: "/admin/reviews",
  CONTACT_MESSAGE: "/admin/contact-messages",
  CATEGORY: "/admin/categories",
};