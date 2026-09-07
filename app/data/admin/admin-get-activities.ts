import "server-only";

import { Prisma, type ActivityAction, type ActivityEntityType } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

import {
  type LivenessByType,
  type tActivityFilterOptions,
  type tActivityItem,
} from "./activity-types";
import { requireAdmin } from "./require-admin";

export type {
  tActivityItem,
  LivenessByType,
  SerializedLiveness,
  tActivityActorOption,
  tActivityFilterOptions,
} from "./activity-types";
export { serializeLiveness, mergeLiveness, isEntityAlive } from "./activity-types";

export type tActivityPage = {
  items: tActivityItem[];
  nextCursor: string | null;
  liveness: LivenessByType;
};

const DEFAULT_TAKE = 20;

export type ActivityQuery = {
  actorId?: string | null;
  action?: ActivityAction | null;
  entityType?: ActivityEntityType | null;
  entityId?: string | null;
  from?: Date | null;
  to?: Date | null;
  cursor?: string | null;
  take?: number;
};

type EntityIdGroup = {
  type: ActivityEntityType;
  ids: string[];
};

type EntityIdFetcher = (
  ids: string[],
) => Promise<{ id: string }[]>;

const ENTITY_TABLE_FETCHERS: Record<ActivityEntityType, EntityIdFetcher> = {
  COURSE: (ids) =>
    prisma.course.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  CHAPTER: (ids) =>
    prisma.courseChapter.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  LESSON: (ids) =>
    prisma.lesson.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  QUIZ: (ids) =>
    prisma.quiz.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  REVIEW: (ids) =>
    prisma.courseReview.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  CONTACT_MESSAGE: (ids) =>
    prisma.contactMessage.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
  CATEGORY: (ids) =>
    prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    }),
};

async function computeLiveness(
  groups: EntityIdGroup[],
): Promise<LivenessByType> {
  const map: LivenessByType = {};

  await Promise.all(
    groups.map(async ({ type, ids }) => {
      if (ids.length === 0) return;
      const alive = await ENTITY_TABLE_FETCHERS[type](ids);
      map[type] = new Set(alive.map((r) => r.id));
    }),
  );

  return map;
}

function groupEntityIds(items: tActivityItem[]): EntityIdGroup[] {
  const buckets: Record<ActivityEntityType, Set<string>> = {
    COURSE: new Set(),
    CHAPTER: new Set(),
    LESSON: new Set(),
    QUIZ: new Set(),
    REVIEW: new Set(),
    CONTACT_MESSAGE: new Set(),
    CATEGORY: new Set(),
  };

  for (const item of items) {
    if (item.entityId) buckets[item.entityType].add(item.entityId);
  }

  return (Object.keys(buckets) as ActivityEntityType[]).flatMap((type) => {
    const ids = Array.from(buckets[type]);
    return ids.length > 0 ? [{ type, ids }] : [];
  });
}

export async function adminGetActivities(
  query: ActivityQuery = {},
): Promise<tActivityPage> {
  await requireAdmin();

  const take = Math.min(Math.max(query.take ?? DEFAULT_TAKE, 1), 100);
  const where: Prisma.ActivityWhereInput = {
    actorId: query.actorId || undefined,
    action: query.action || undefined,
    entityType: query.entityType || undefined,
    entityId: query.entityId || undefined,
    createdAt: {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    },
  };

  const rows = await prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      createdAt: true,
      actorType: true,
      actorId: true,
      actorNameSnapshot: true,
      action: true,
      entityType: true,
      entityId: true,
      entityLabel: true,
      metadata: true,
      actor: { select: { name: true, image: true } },
    },
  });

  const hasMore = rows.length > take;
  const items = (hasMore ? rows.slice(0, take) : rows).map<tActivityItem>((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    actorType: r.actorType,
    actorId: r.actorId,
    actorName: r.actor?.name ?? r.actorNameSnapshot ?? null,
    actorImage: r.actor?.image ?? null,
    action: r.action,
    entityType: r.entityType,
    entityId: r.entityId,
    entityLabel: r.entityLabel,
    metadata: r.metadata,
  }));

  const liveness = await computeLiveness(groupEntityIds(items));

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
    liveness,
  };
}

export async function adminGetActivityFilterOptions(): Promise<tActivityFilterOptions> {
  await requireAdmin();

  const [actions, entityTypes, actors] = await Promise.all([
    prisma.activity.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    }),
    prisma.activity.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    }),
    prisma.user.findMany({
      where: { activities: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    actions: actions.map((a) => a.action),
    entityTypes: entityTypes.map((e) => e.entityType),
    actors,
  };
}