import { Prisma } from "@/lib/generated/prisma/client";

import type {
  SerializedLiveness,
  tActivityItem,
} from "@/app/data/admin/admin-get-activities";
import { ENTITY_HREF_PREFIX } from "@/lib/activity/activity-actions";

/**
 * True when the entity the activity row references still exists in the
 * database. Rows pointing at deleted entities render with a "Deleted" badge
 * and no link to avoid dangling navigation.
 *
 * Rows whose `entityType` has no per-row destination (CONTACT_MESSAGE,
 * CATEGORY) intentionally return `false` from `entityHref` already, so we
 * only need to check liveness for the families where it matters.
 */
export function isEntityDeleted(
  item: tActivityItem,
  liveness: SerializedLiveness,
): boolean {
  if (!item.entityId) return false;
  const alive = liveness[item.entityType];
  if (!alive) return false;
  return !alive.includes(item.entityId);
}

export function entityHref(
  item: tActivityItem,
  liveness?: SerializedLiveness,
): string | null {
  if (!item.entityId) return null;

  if (liveness && isEntityDeleted(item, liveness)) return null;

  const prefix = ENTITY_HREF_PREFIX[item.entityType];
  if (!prefix) return null;

  if (
    item.entityType === "CHAPTER" ||
    item.entityType === "LESSON" ||
    item.entityType === "QUIZ"
  ) {
    const courseId = readMetadataString(item.metadata, "courseId");
    if (!courseId) return null;
    return `${prefix}/${courseId}/edit`;
  }

  if (item.entityType === "COURSE") {
    return `${prefix}/${item.entityId}/edit`;
  }

  if (item.entityType === "REVIEW") {
    return `${prefix}/${item.entityId}`;
  }

  return prefix;
}

export function readMetadata(
  metadata: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (metadata === null || metadata === undefined) return null;
  if (typeof metadata !== "object" || Array.isArray(metadata)) return null;
  return metadata as Record<string, unknown>;
}

export function readMetadataString(
  metadata: Prisma.JsonValue | null,
  key: string,
): string | null {
  const obj = readMetadata(metadata);
  if (!obj) return null;
  const value = obj[key];
  if (typeof value !== "string" || value.length === 0) return null;
  return value;
}