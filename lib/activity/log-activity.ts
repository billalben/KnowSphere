import "server-only";

import { Prisma, type PrismaClient } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

import { ACTIVITY_METADATA_SCHEMAS } from "./schemas";
import type { ActivityClient, LogActivityInput } from "./types";

export class ActivityMetadataError extends Error {
  constructor(
    action: string,
    public readonly zodError: unknown,
  ) {
    super(
      `Invalid activity metadata for action ${action}: ${JSON.stringify(
        zodError,
      )}`,
    );
    this.name = "ActivityMetadataError";
  }
}

export async function logActivity(
  input: LogActivityInput,
  client: ActivityClient = prisma,
) {
  const schema = ACTIVITY_METADATA_SCHEMAS[input.action];
  if (schema && input.metadata !== undefined && input.metadata !== null) {
    const parsed = schema.safeParse(input.metadata);
    if (!parsed.success) {
      throw new ActivityMetadataError(input.action, parsed.error);
    }
  }

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