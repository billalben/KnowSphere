import "server-only";

import { Prisma, type ActivityAction, type ActivityEntityType } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

import { requireAdmin } from "./require-admin";

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

export type tActivityPage = {
  items: tActivityItem[];
  nextCursor: string | null;
};

const DEFAULT_TAKE = 20;

export type ActivityQuery = {
  actorId?: string | null;
  action?: ActivityAction | null;
  entityType?: ActivityEntityType | null;
  from?: Date | null;
  to?: Date | null;
  cursor?: string | null;
  take?: number;
};

export async function adminGetActivities(
  query: ActivityQuery = {},
): Promise<tActivityPage> {
  await requireAdmin();

  const take = Math.min(Math.max(query.take ?? DEFAULT_TAKE, 1), 100);
  const where: Prisma.ActivityWhereInput = {
    actorId: query.actorId || undefined,
    action: query.action || undefined,
    entityType: query.entityType || undefined,
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

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
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