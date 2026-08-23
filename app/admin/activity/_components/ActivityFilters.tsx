"use client";

import {
  parseAsString,
  parseAsStringLiteral,
  parseAsTimestamp,
  useQueryStates,
} from "nuqs";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_PRESENTATION } from "@/lib/activity/activity-actions";

import type { tActivityFilterOptions } from "@/app/data/admin/admin-get-activities";
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from "../_lib/filters";

// Defined inline (not imported from a shared _lib file) because nuqs parsers
// pull in a "use client" boundary — sharing them with a server component
// breaks `.withDefault` on the server bundle.
export const activitySearchParams = {
  actorId: parseAsString.withDefault(""),
  action: parseAsStringLiteral(ACTIVITY_ACTIONS).withDefault("all"),
  entityType: parseAsStringLiteral(ENTITY_TYPES).withDefault("all"),
  from: parseAsTimestamp,
  to: parseAsTimestamp,
};

type Props = {
  filterOptions: tActivityFilterOptions;
};

export function ActivityFilters({ filterOptions }: Props) {
  const [params, setParams] = useQueryStates(activitySearchParams, {
    shallow: false,
  });

  const isFiltered =
    params.actorId !== "" ||
    params.action !== "all" ||
    params.entityType !== "all" ||
    params.from !== null ||
    params.to !== null;

  const exportHref = buildExportHref(params);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={params.actorId || "all"}
        onValueChange={(value) =>
          setParams({ actorId: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All admins</SelectItem>
          {filterOptions.actors.map((actor) => (
            <SelectItem key={actor.id} value={actor.id}>
              {actor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.action}
        onValueChange={(value) =>
          setParams({ action: value as typeof params.action })
        }
      >
        <SelectTrigger className="min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          {filterOptions.actions.map((action) => (
            <SelectItem key={action} value={action}>
              {ACTIVITY_PRESENTATION[action].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.entityType}
        onValueChange={(value) =>
          setParams({ entityType: value as typeof params.entityType })
        }
      >
        <SelectTrigger className="min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All entities</SelectItem>
          {filterOptions.entityTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type.toLowerCase().replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() =>
            setParams({
              actorId: "",
              action: "all",
              entityType: "all",
              from: null,
              to: null,
            })
          }
        >
          Clear filters
        </Button>
      )}

      <Button variant="outline" size="sm" render={<a href={exportHref} />}>
        Export CSV
      </Button>
    </div>
  );
}

type Params = ReturnType<typeof useQueryStates<typeof activitySearchParams>>[0];

function buildExportHref(params: Params): string {
  const search = new URLSearchParams();
  if (params.actorId) search.set("actorId", params.actorId);
  if (params.action !== "all") search.set("action", params.action);
  if (params.entityType !== "all") search.set("entityType", params.entityType);
  if (params.from !== null) search.set("from", String(params.from));
  if (params.to !== null) search.set("to", String(params.to));
  const qs = search.toString();
  return qs ? `/api/admin/activity/export?${qs}` : "/api/admin/activity/export";
}