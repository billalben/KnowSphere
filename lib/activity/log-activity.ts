import "server-only";

import { Prisma, type PrismaClient } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

import type { ActivityClient, LogActivityInput } from "./types";

export async function logActivity(
  input: LogActivityInput,
  client: ActivityClient = prisma,
) {
  const data: Prisma.ActivityUncheckedCreateInput = {
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    actorNameSnapshot: input.actorNameSnapshot ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    entityLabel: input.entityLabel ?? null,
    metadata:
      input.metadata === undefined || input.metadata === null
        ? Prisma.JsonNull
        : (input.metadata as Prisma.JsonObject),
  };

  return (client as PrismaClient).activity.create({ data });
}