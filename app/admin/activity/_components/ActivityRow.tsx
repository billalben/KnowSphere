import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ACTIVITY_PRESENTATION,
  type ActivityTone,
} from "@/lib/activity/activity-actions";
import { formatFieldValue } from "@/lib/activity/changes";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { ChevronDownIcon } from "lucide-react";

import type {
  SerializedLiveness,
  tActivityItem,
} from "@/app/data/admin/admin-get-activities";
import { entityHref, isEntityDeleted, readMetadata } from "../_lib/metadata";

const TONE_CLASSES: Record<ActivityTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  positive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  destructive: "bg-destructive/10 text-destructive",
};

const DELETED_BADGE_CLASSES =
  "bg-muted text-muted-foreground line-through decoration-muted-foreground/50";

const VISIBLE_DIFFS_COLLAPSED = 6;

function initials(name: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

type DiffEntry =
  | {
      kind: "scalar";
      label: string;
      from: unknown;
      to: unknown;
    }
  | {
      kind: "array";
      label: string;
      added: unknown[];
      removed: unknown[];
    }
  | {
      kind: "length";
      label: string;
      fromLength: number;
      toLength: number;
    };

function isDiffEntry(value: unknown): value is DiffEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as { kind?: unknown };
  return (
    v.kind === "scalar" ||
    v.kind === "array" ||
    v.kind === "length"
  );
}

function diffEntries(metadata: unknown): DiffEntry[] {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }

  const obj = metadata as Record<string, unknown>;
  const out: DiffEntry[] = [];

  // New multi-shape schema (lib/activity/schemas.ts):
  //   metadata = { fields: { [label]: { from, to } | { fromLength, toLength } | { added: [], removed: [] } } }
  const fields = obj.fields;
  if (fields && typeof fields === "object" && !Array.isArray(fields)) {
    for (const [label, value] of Object.entries(
      fields as Record<string, unknown>,
    )) {
      if (isDiffEntry(value)) {
        out.push(value);
        continue;
      }
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        ("from" in value || "to" in value)
      ) {
        const v = value as { from?: unknown; to?: unknown };
        out.push({ kind: "scalar", label, from: v.from, to: v.to });
      }
    }
    if (out.length > 0) return out;
  }

  // Legacy single-field shape: { from, to, field? }.
  if (
    "from" in obj ||
    "to" in obj ||
    obj.from !== undefined ||
    obj.to !== undefined
  ) {
    const label =
      typeof obj.field === "string" && obj.field.length > 0
        ? obj.field
        : "status";
    return [{ kind: "scalar", label, from: obj.from, to: obj.to }];
  }

  return out;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  return formatFieldValue(v);
}

function ScalarChip({ label, from, to }: { label: string; from: unknown; to: unknown }) {
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs">
      <span className="text-foreground/70 font-semibold">{label}:</span>
      <span className="line-through opacity-70">{formatValue(from)}</span>
      <span aria-hidden>→</span>
      <span className="text-foreground font-medium">{formatValue(to)}</span>
    </span>
  );
}

function ArrayChip({
  label,
  added,
  removed,
}: {
  label: string;
  added: unknown[];
  removed: unknown[];
}) {
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs">
      <span className="text-foreground/70 font-semibold">{label}:</span>
      {removed.length > 0 ? (
        <span className="text-destructive line-through opacity-80">
          −{formatValue(removed)}
        </span>
      ) : null}
      {added.length > 0 ? (
        <span className="text-emerald-700 dark:text-emerald-300">
          +{formatValue(added)}
        </span>
      ) : null}
      {added.length === 0 && removed.length === 0 ? (
        <span className="opacity-70">(order-only change)</span>
      ) : null}
    </span>
  );
}

function LengthChip({
  label,
  fromLength,
  toLength,
}: {
  label: string;
  fromLength: number;
  toLength: number;
}) {
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs">
      <span className="text-foreground/70 font-semibold">{label}:</span>
      <span className="line-through opacity-70">{fromLength} chars</span>
      <span aria-hidden>→</span>
      <span className="text-foreground font-medium">{toLength} chars</span>
    </span>
  );
}

function DiffChip({ entry }: { entry: DiffEntry }) {
  if (entry.kind === "scalar") {
    return (
      <ScalarChip label={entry.label} from={entry.from} to={entry.to} />
    );
  }
  if (entry.kind === "array") {
    return (
      <ArrayChip
        label={entry.label}
        added={entry.added}
        removed={entry.removed}
      />
    );
  }
  return (
    <LengthChip
      label={entry.label}
      fromLength={entry.fromLength}
      toLength={entry.toLength}
    />
  );
}

function FilterByEntityLink({
  activity,
}: {
  activity: tActivityItem;
}) {
  return (
    <a
      href={buildFilterByEntityHref(activity)}
      className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
      title={`Show only activity for this ${activity.entityType.toLowerCase().replace(/_/g, " ")}`}
    >
      Filter
    </a>
  );
}

function buildFilterByEntityHref(activity: tActivityItem): string {
  const sp = new URLSearchParams();
  sp.set("entityType", activity.entityType);
  if (activity.entityId) sp.set("entityId", activity.entityId);
  return `/admin/activity?${sp.toString()}`;
}

export function ActivityRow({
  activity,
  liveness,
}: {
  activity: tActivityItem;
  liveness: SerializedLiveness;
}) {
  const presentation = ACTIVITY_PRESENTATION[activity.action];
  const Icon = presentation.icon;
  const href = entityHref(activity, liveness);
  const meta = readMetadata(activity.metadata);
  const diffs = diffEntries(meta);
  const isDeleted = isEntityDeleted(activity, liveness);
  const canFilterByEntity = Boolean(activity.entityId);
  const showCollapsible = diffs.length > VISIBLE_DIFFS_COLLAPSED;
  const visibleDiffs = showCollapsible
    ? diffs.slice(0, VISIBLE_DIFFS_COLLAPSED)
    : diffs;
  const hiddenDiffs = showCollapsible ? diffs.slice(VISIBLE_DIFFS_COLLAPSED) : [];
  const hiddenCount = hiddenDiffs.length;

  const label = activity.entityLabel ?? activity.entityId ?? "—";

  return (
    <li className="border-border/60 flex items-start gap-3 border-b px-4 py-3 last:border-b-0">
      <Avatar size="sm" className="mt-0.5">
        {activity.actorImage && (
          <AvatarImage src={activity.actorImage} alt={activity.actorName ?? ""} />
        )}
        <AvatarFallback>{initials(activity.actorName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {activity.actorName ?? "Unknown admin"}
          </span>
          <Badge
            variant="secondary"
            className={TONE_CLASSES[presentation.tone]}
          >
            <Icon className="size-3!" />
            {presentation.label}
          </Badge>
          {href ? (
            <a
              href={href}
              className="text-foreground truncate text-sm font-medium hover:underline"
            >
              {label}
            </a>
          ) : (
            <span
              className={
                isDeleted
                  ? `text-muted-foreground truncate text-sm font-medium ${DELETED_BADGE_CLASSES}`
                  : "text-foreground truncate text-sm font-medium"
              }
            >
              {label}
            </span>
          )}
          {isDeleted ? (
            <Badge variant="outline" className="text-muted-foreground text-[10px] font-normal">
              Deleted
            </Badge>
          ) : null}
          {canFilterByEntity && !isDeleted ? (
            <FilterByEntityLink activity={activity} />
          ) : null}
        </div>

        {visibleDiffs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {visibleDiffs.map((d, i) => (
              <DiffChip key={`${d.label}-${i}`} entry={d} />
            ))}
            {showCollapsible && hiddenCount > 0 ? (
              <Collapsible>
                <CollapsibleTrigger
                  render={
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs underline-offset-2 hover:underline"
                      aria-label={`Show ${hiddenCount} more field ${
                        hiddenCount === 1 ? "change" : "changes"
                      }`}
                    />
                  }
                >
                  <ChevronDownIcon className="size-3!" />
                  Show {hiddenCount} more
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 flex flex-wrap gap-2">
                  {hiddenDiffs.map((d, i) => (
                    <DiffChip
                      key={`hidden-${d.label}-${i}`}
                      entry={d}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        )}
      </div>

      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger
            render={
              <time
                dateTime={activity.createdAt.toISOString()}
                className="text-muted-foreground shrink-0 cursor-default text-xs"
              />
            }
          >
            {formatRelativeTime(activity.createdAt)}
          </TooltipTrigger>
          <TooltipContent>{activity.createdAt.toLocaleString()}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  );
}