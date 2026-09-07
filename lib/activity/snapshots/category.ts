import "server-only";

import type { Category } from "@/lib/generated/prisma/client";

import { buildChanges, type FieldDescriptor } from "../changes";

export type CategoryAuditSnapshot = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryRowInput = Pick<Category, "id" | "name" | "slug">;

export function snapshotCategory(row: CategoryRowInput): CategoryAuditSnapshot {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

export const CATEGORY_AUDIT_FIELDS: ReadonlyArray<FieldDescriptor<CategoryAuditSnapshot>> = [
  { key: "name", label: "name", pick: (r) => r.name },
  { key: "slug", label: "slug", pick: (r) => r.slug },
];

export function buildCategoryFieldChanges(
  before: CategoryAuditSnapshot,
  after: CategoryAuditSnapshot,
): Record<string, { from: unknown; to: unknown }> {
  const changes = buildChanges(before, after, CATEGORY_AUDIT_FIELDS);
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
