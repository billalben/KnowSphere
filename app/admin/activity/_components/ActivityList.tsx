import { HistoryIcon } from "lucide-react";

import { EmptyState } from "@/components/general/EmptyState";
import {
  adminGetActivities,
  type tActivityItem,
} from "@/app/data/admin/admin-get-activities";

import { LoadMoreActivities } from "./LoadMoreActivities";

type FilterParams = {
  actorId: string;
  action: string;
  entityType: string;
  from: number | null;
  to: number | null;
};

type Props = {
  filters: {
    actorId: string | null;
    action: tActivityItem["action"] | null;
    entityType: tActivityItem["entityType"] | null;
    from: Date | null;
    to: Date | null;
    take: number;
  };
  filterParams: FilterParams;
};

export async function ActivityList({ filters, filterParams }: Props) {
  const page = await adminGetActivities(filters);

  if (page.items.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="No activity yet"
        description="When admins perform actions, they will appear here."
      />
    );
  }

  return (
    <LoadMoreActivities
      key={stableKey(filterParams)}
      initialItems={page.items}
      initialCursor={page.nextCursor}
      actorId={filterParams.actorId}
      action={(filterParams.action as never) ?? "all"}
      entityType={(filterParams.entityType as never) ?? "all"}
      from={filterParams.from}
      to={filterParams.to}
    />
  );
}

function stableKey(params: FilterParams): string {
  return `${params.actorId}|${params.action}|${params.entityType}|${params.from ?? ""}|${params.to ?? ""}`;
}