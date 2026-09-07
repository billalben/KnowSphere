"use client";

import { useState, useTransition } from "react";

import { Loader2Icon } from "lucide-react";

import type {
  SerializedLiveness,
  tActivityItem,
} from "@/app/data/admin/activity-types";
import { mergeLiveness } from "@/app/data/admin/activity-types";
import { Button } from "@/components/ui/button";

import { ActivityRow } from "./ActivityRow";
import { loadMoreActivitiesAction } from "./actions";

type LoadMoreProps = {
  initialItems: tActivityItem[];
  initialCursor: string | null;
  initialLiveness: SerializedLiveness;
  actorId: string;
  action: tActivityItem["action"] | "all";
  entityType: tActivityItem["entityType"] | "all";
  entityId: string;
  from: number | null;
  to: number | null;
};

export function LoadMoreActivities({
  initialItems,
  initialCursor,
  initialLiveness,
  actorId,
  action,
  entityType,
  entityId,
  from,
  to,
}: LoadMoreProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [liveness, setLiveness] = useState<SerializedLiveness>(initialLiveness);
  const [pending, startTransition] = useTransition();

  if (!cursor) {
    return (
      <ul className="border-border/60 divide-y rounded-lg border">
        {items.map((item) => (
          <ActivityRow key={item.id} activity={item} liveness={liveness} />
        ))}
      </ul>
    );
  }

  return (
    <div>
      <ul className="border-border/60 divide-y rounded-lg border">
        {items.map((item) => (
          <ActivityRow key={item.id} activity={item} liveness={liveness} />
        ))}
      </ul>
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const next = await loadMoreActivitiesAction({
                cursor,
                actorId,
                action,
                entityType,
                entityId,
                from: from ?? undefined,
                to: to ?? undefined,
              });
              setItems((prev) => [...prev, ...next.items]);
              setCursor(next.nextCursor);
              setLiveness((prev) => mergeLiveness(prev, next.liveness));
            })
          }
        >
          {pending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Load more"
          )}
        </Button>
      </div>
    </div>
  );
}