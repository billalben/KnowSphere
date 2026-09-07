"use client";

import {
  parseAsString,
  parseAsStringLiteral,
  parseAsTimestamp,
  useQueryStates,
} from "nuqs";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVITY_PRESENTATION,
  ENTITY_PRESENTATION,
} from "@/lib/activity/activity-actions";

import type { tActivityFilterOptions } from "@/app/data/admin/activity-types";
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from "../_lib/filters";

// Defined inline (not imported from a shared _lib file) because nuqs parsers
// pull in a "use client" boundary — sharing them with a server component
// breaks `.withDefault` on the server bundle.
export const activitySearchParams = {
  actorId: parseAsString.withDefault(""),
  action: parseAsStringLiteral(ACTIVITY_ACTIONS).withDefault("all"),
  entityType: parseAsStringLiteral(ENTITY_TYPES).withDefault("all"),
  entityId: parseAsString.withDefault(""),
  from: parseAsTimestamp,
  to: parseAsTimestamp,
};

type EntityFilterContext = {
  entityType: tActivityFilterOptions["entityTypes"][number];
  entityId: string;
};

type Props = {
  filterOptions: tActivityFilterOptions;
  entityFilterContext: EntityFilterContext | null;
};

export function ActivityFilters({
  filterOptions,
  entityFilterContext,
}: Props) {
  const [params, setParams] = useQueryStates(activitySearchParams, {
    shallow: false,
  });

  const isFiltered =
    params.actorId !== "" ||
    params.action !== "all" ||
    params.entityType !== "all" ||
    params.entityId !== "" ||
    params.from !== null ||
    params.to !== null;

  const exportHref = buildExportHref(params);

  return (
    <div className="flex flex-col gap-3">
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
                entityId: "",
                from: null,
                to: null,
              })
            }
          >
            Clear filters
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          render={<a href={exportHref} />}
          nativeButton={false}
        >
          Export CSV
        </Button>
      </div>

      {entityFilterContext ? (
        <div className="bg-muted/40 inline-flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-xs">
          <span className="text-muted-foreground">Filtering by</span>
          <span className="text-foreground font-medium">
            {ENTITY_PRESENTATION[entityFilterContext.entityType]?.label ??
              entityFilterContext.entityType.toLowerCase()}
          </span>
          <code className="bg-background rounded px-1.5 py-0.5 font-mono text-[10px]">
            {entityFilterContext.entityId.slice(0, 12)}
            {entityFilterContext.entityId.length > 12 ? "…" : ""}
          </code>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5"
            onClick={() =>
              setParams({ entityType: "all", entityId: "" })
            }
            title="Clear entity filter"
          >
            <XIcon className="size-3!" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

type Params = ReturnType<typeof useQueryStates<typeof activitySearchParams>>[0];

function buildExportHref(params: Params): string {
  const search = new URLSearchParams();
  if (params.actorId) search.set("actorId", params.actorId);
  if (params.action !== "all") search.set("action", params.action);
  if (params.entityType !== "all") search.set("entityType", params.entityType);
  if (params.entityId) search.set("entityId", params.entityId);
  if (params.from !== null) search.set("from", String(params.from));
  if (params.to !== null) search.set("to", String(params.to));
  const qs = search.toString();
  return qs ? `/api/admin/activity/export?${qs}` : "/api/admin/activity/export";
}