"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import {
  adminGetActivities,
  serializeLiveness,
  type tActivityItem,
  type tActivityPage,
} from "@/app/data/admin/admin-get-activities";

export async function loadMoreActivitiesAction({
  cursor,
  actorId,
  action,
  entityType,
  entityId,
  from,
  to,
}: {
  cursor: string;
  actorId?: string;
  action?: tActivityItem["action"] | "all";
  entityType?: tActivityItem["entityType"] | "all";
  entityId?: string;
  from?: number;
  to?: number;
}): Promise<
  Omit<tActivityPage, "items" | "liveness"> & {
    items: tActivityItem[];
    liveness: ReturnType<typeof serializeLiveness>;
  }
> {
  await auth.api.getSession({ headers: await headers() });

  const result = await adminGetActivities({
    cursor,
    actorId: actorId || null,
    action: action && action !== "all" ? action : null,
    entityType: entityType && entityType !== "all" ? entityType : null,
    entityId: entityId || null,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
    take: 20,
  });

  return {
    items: result.items,
    nextCursor: result.nextCursor,
    liveness: serializeLiveness(result.liveness),
  };
}