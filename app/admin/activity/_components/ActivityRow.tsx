import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { formatRelativeTime } from "@/lib/format-relative-time";

import type { tActivityItem } from "@/app/data/admin/admin-get-activities";
import { entityHref, readMetadata } from "../_lib/metadata";

const TONE_CLASSES: Record<ActivityTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  positive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  destructive: "bg-destructive/10 text-destructive",
};

function initials(name: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

type DiffEntry = { label: string; from: unknown; to: unknown };

function diffEntries(metadata: unknown): DiffEntry[] {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }

  const obj = metadata as Record<string, unknown>;

  if (
    typeof obj.from !== "undefined" ||
    typeof obj.to !== "undefined"
  ) {
    const label =
      typeof obj.field === "string" && obj.field.length > 0
        ? obj.field
        : "status";
    return [{ label, from: obj.from, to: obj.to }];
  }

  const fields = obj.fields;
  if (fields && typeof fields === "object" && !Array.isArray(fields)) {
    return Object.entries(fields as Record<string, unknown>).flatMap(
      ([label, value]) => {
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          ("from" in value || "to" in value)
        ) {
          const v = value as { from?: unknown; to?: unknown };
          return [{ label, from: v.from, to: v.to }];
        }
        return [];
      },
    );
  }

  return [];
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function ActivityRow({ activity }: { activity: tActivityItem }) {
  const presentation = ACTIVITY_PRESENTATION[activity.action];
  const Icon = presentation.icon;
  const href = entityHref(activity);
  const meta = readMetadata(activity.metadata);
  const diffs = diffEntries(meta);

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
              {activity.entityLabel ?? activity.entityId ?? "—"}
            </a>
          ) : (
            <span className="text-foreground truncate text-sm font-medium">
              {activity.entityLabel ?? activity.entityId ?? "—"}
            </span>
          )}
        </div>

        {diffs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {diffs.map((d, i) => (
              <span
                key={`${d.label}-${i}`}
                className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs"
              >
                <span className="text-foreground/70 font-semibold">
                  {d.label}:
                </span>
                <span className="line-through opacity-70">
                  {formatValue(d.from)}
                </span>
                <span aria-hidden>→</span>
                <span className="text-foreground font-medium">
                  {formatValue(d.to)}
                </span>
              </span>
            ))}
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