import type {
  ActivityAction,
  ActivityEntityType,
} from "@/lib/generated/prisma/client";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Client-safe activity types and helpers.
 *
 * Keep this file free of any side-effects (no `import "server-only"`,
 * no Prisma client imports) so client components can import from it.
 * Anything server-only (Prisma queries, `tActivityPage` with its `Set`-shaped
 * `liveness`) belongs in `admin-get-activities.ts`.
 */

export type tActivityItem = {
  id: string;
  createdAt: Date;
  actorType: "ADMIN" | "SYSTEM";
  actorId: string | null;
  actorName: string | null;
  actorImage: string | null;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string | null;
  entityLabel: string | null;
  metadata: Prisma.JsonValue | null;
};

/** Server-side: alive IDs keyed by entity type. Contains live `Set`s. */
export type LivenessByType = Partial<Record<ActivityEntityType, Set<string>>>;

/** Client-safe serialization of `LivenessByType` for React props. */
export type SerializedLiveness = Record<string, string[]>;

export function serializeLiveness(
  liveness: LivenessByType,
): SerializedLiveness {
  const out: SerializedLiveness = {};
  for (const [type, ids] of Object.entries(liveness)) {
    if (ids) out[type] = Array.from(ids);
  }
  return out;
}

/**
 * Merge a freshly-loaded liveness snapshot into a running client-side map.
 * Existing entries persist; new entries extend the set so an entity that
 * stays alive across page boundaries remains reflected in subsequent pages.
 */
export function mergeLiveness(
  current: SerializedLiveness,
  next: SerializedLiveness,
): SerializedLiveness {
  const out: SerializedLiveness = { ...current };
  for (const [type, ids] of Object.entries(next)) {
    if (!ids) continue;
    const existing = out[type] ?? [];
    out[type] = Array.from(new Set([...existing, ...ids]));
  }
  return out;
}

export function isEntityAlive(
  liveness: SerializedLiveness,
  entityType: ActivityEntityType,
  entityId: string | null,
): boolean {
  if (!entityId) return true;
  const alive = liveness[entityType];
  return alive ? alive.includes(entityId) : false;
}

export type tActivityActorOption = {
  id: string;
  name: string;
};

export type tActivityFilterOptions = {
  actions: ActivityAction[];
  entityTypes: ActivityEntityType[];
  actors: tActivityActorOption[];
};
