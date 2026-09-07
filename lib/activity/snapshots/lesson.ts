import "server-only";

import type { Lesson } from "@/lib/generated/prisma/client";

import { buildChanges, type FieldDescriptor } from "../changes";

export type LessonAuditSnapshot = {
  id: string;
  title: string;
  description: string;
  position: number;
  videoKey: string | null;
};

export type LessonRowInput = Pick<
  Lesson,
  "id" | "title" | "description" | "position" | "videoKey"
>;

export function snapshotLesson(row: LessonRowInput): LessonAuditSnapshot {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    position: row.position,
    videoKey: row.videoKey ?? null,
  };
}

export const LESSON_AUDIT_FIELDS: ReadonlyArray<FieldDescriptor<LessonAuditSnapshot>> = [
  { key: "title", label: "title", pick: (r) => r.title },
  { key: "description", label: "description", pick: (r) => r.description },
  { key: "videoKey", label: "video", pick: (r) => r.videoKey },
  { key: "position", label: "position", pick: (r) => r.position },
];

export function buildLessonFieldChanges(
  before: LessonAuditSnapshot,
  after: LessonAuditSnapshot,
): Record<string, { from: unknown; to: unknown }> {
  const changes = buildChanges(before, after, LESSON_AUDIT_FIELDS);
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, change] of Object.entries(changes)) {
    if (change.kind === "scalar") {
      out[key] = { from: change.from, to: change.to };
    } else if (change.kind === "length") {
      out[key] = {
        from: `${change.fromLength} chars`,
        to: `${change.toLength} chars`,
      };
    }
  }
  return out;
}
