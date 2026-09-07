import "server-only";

import type { CourseChapter } from "@/lib/generated/prisma/client";

import { buildChanges, type FieldDescriptor } from "../changes";

export type ChapterAuditSnapshot = {
  id: string;
  title: string;
  position: number;
};

export type ChapterRowInput = Pick<CourseChapter, "id" | "title" | "position">;

export function snapshotChapter(row: ChapterRowInput): ChapterAuditSnapshot {
  return {
    id: row.id,
    title: row.title,
    position: row.position,
  };
}

export const CHAPTER_AUDIT_FIELDS: ReadonlyArray<FieldDescriptor<ChapterAuditSnapshot>> = [
  { key: "title", label: "title", pick: (r) => r.title },
  { key: "position", label: "position", pick: (r) => r.position },
];

export function buildChapterFieldChanges(
  before: ChapterAuditSnapshot,
  after: ChapterAuditSnapshot,
): Record<string, { from: unknown; to: unknown }> {
  const changes = buildChanges(before, after, CHAPTER_AUDIT_FIELDS);
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, change] of Object.entries(changes)) {
    if (change.kind === "scalar") {
      out[key] = { from: change.from, to: change.to };
    }
  }
  return out;
}
