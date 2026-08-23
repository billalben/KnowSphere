import "server-only";

import type { ActorType, ActivityAction, ActivityEntityType } from "@/lib/generated/prisma/client";
import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";

export type ActivityClient = PrismaClient | Prisma.TransactionClient;

export type LogActivityInput = {
  actorType: ActorType;
  actorId?: string | null;
  actorNameSnapshot?: string | null;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ActivityFilters = {
  actorId?: string | null;
  action?: ActivityAction | null;
  entityType?: ActivityEntityType | null;
  from?: Date | null;
  to?: Date | null;
  cursor?: string | null;
  take?: number;
};