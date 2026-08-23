"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import {
  adminGetActivities,
  type tActivityItem,
  type tActivityPage,
} from "@/app/data/admin/admin-get-activities";

export async function loadMoreActivitiesAction({
  cursor,
  actorId,
  action,
  entityType,
  from,
  to,
}: {
  cursor: string;
  actorId?: string;
  action?: tActivityItem["action"] | "all";
  entityType?: tActivityItem["entityType"] | "all";
  from?: number;
  to?: number;
}): Promise<Omit<tActivityPage, "items"> & { items: tActivityItem[] }> {
  await auth.api.getSession({ headers: await headers() });

  const result = await adminGetActivities({
    cursor,
    actorId: actorId || null,
    action: action && action !== "all" ? action : null,
    entityType: entityType && entityType !== "all" ? entityType : null,
    from: from ? new Date(from) : null,
    to: to ? new Date(to) : null,
    take: 20,
  });

  return result;
}