import "server-only";

import type { Course, CourseLevel, CourseStatus } from "@/lib/generated/prisma/client";

import { buildChanges, type FieldDescriptor } from "../changes";

export type CourseAuditSnapshot = {
  id: string;
  title: string;
  slug: string;
  description: string;
  smallDesc: string;
  price: number;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  fileKey: string | null;
  categoryNames: string[];
};

export type CourseRowInput = Pick<
  Course,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "smallDesc"
  | "price"
  | "duration"
  | "level"
  | "status"
  | "fileKey"
> & {
  categories?: { name: string }[];
};

export function snapshotCourse(row: CourseRowInput): CourseAuditSnapshot {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    smallDesc: row.smallDesc,
    price: row.price,
    duration: row.duration,
    level: row.level,
    status: row.status,
    fileKey: row.fileKey ?? null,
    categoryNames: (row.categories ?? []).map((c) => c.name).sort(),
  };
}

export const COURSE_AUDIT_FIELDS: ReadonlyArray<FieldDescriptor<CourseAuditSnapshot>> = [
  { key: "title", label: "title", pick: (r) => r.title },
  { key: "slug", label: "slug", pick: (r) => r.slug },
  {
    key: "smallDesc",
    label: "short description",
    pick: (r) => r.smallDesc,
  },
  { key: "description", label: "description", pick: (r) => r.description },
  { key: "price", label: "price", pick: (r) => r.price },
  { key: "level", label: "level", pick: (r) => r.level },
  { key: "status", label: "status", pick: (r) => r.status },
  { key: "fileKey", label: "thumbnail", pick: (r) => r.fileKey },
  {
    key: "categories",
    label: "categories",
    pick: (r) => r.categoryNames,
  },
  { key: "duration", label: "duration", pick: (r) => r.duration },
];

/**
 * Compare two course snapshots and return the changed fields, *excluding* status
 * (status has its own dedicated `COURSE_STATUS_CHANGED` action so it stays
 * visible at a glance).
 */
export function buildCourseFieldChanges(
  before: CourseAuditSnapshot,
  after: CourseAuditSnapshot,
): Record<string, { from: unknown; to: unknown }> {
  const fields = COURSE_AUDIT_FIELDS.filter((f) => f.key !== "status");
  const changes = buildChanges(before, after, fields);

  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, change] of Object.entries(changes)) {
    if (change.kind === "scalar") {
      out[key] = { from: change.from, to: change.to };
    } else if (change.kind === "length") {
      out[key] = {
        from: `${change.fromLength} chars`,
        to: `${change.toLength} chars`,
      };
    } else if (change.kind === "array") {
      out[key] = {
        from: change.removed.length > 0 ? `−${change.removed.join(", ")}` : "—",
        to: change.added.length > 0 ? `+${change.added.join(", ")}` : "—",
      };
    }
  }
  return out;
}
