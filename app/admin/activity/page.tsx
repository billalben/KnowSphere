import { Suspense } from "react";

import {
  adminGetActivityFilterOptions,
} from "@/app/data/admin/admin-get-activities";

import { ActivityFilters } from "./_components/ActivityFilters";
import { ActivityList } from "./_components/ActivityList";
import { ActivityListSkeleton } from "./_components/ActivityListSkeleton";
import { parseActionParam, parseEntityParam } from "./_lib/filters";

type SearchParams = Promise<{
  actorId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}>;

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return new Date(num);
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const filterOptions = await adminGetActivityFilterOptions();

  const filters = {
    actorId: sp.actorId || null,
    action: parseActionParam(sp.action),
    entityType: parseEntityParam(sp.entityType),
    from: parseDate(sp.from),
    to: parseDate(sp.to),
    take: 20,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Activity</h1>
      </div>

      <ActivityFilters filterOptions={filterOptions} />

      <Suspense fallback={<ActivityListSkeleton />}>
        <ActivityList
          filters={filters}
          filterParams={{
            actorId: sp.actorId ?? "",
            action: sp.action ?? "all",
            entityType: sp.entityType ?? "all",
            from: parseDate(sp.from)?.getTime() ?? null,
            to: parseDate(sp.to)?.getTime() ?? null,
          }}
        />
      </Suspense>
    </div>
  );
}