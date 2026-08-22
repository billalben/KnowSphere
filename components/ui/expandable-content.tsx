"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandableContentProps {
  children: ReactNode;
  collapsedHeight?: number;
  expandedMaxHeight?: number;
  defaultExpanded?: boolean;
  labels?: { showMore?: string; showLess?: string };
  fade?: boolean;
  placement?: "start" | "center" | "end";
  id?: string;
  className?: string;
}

export function ExpandableContent({
  children,
  collapsedHeight = 288,
  expandedMaxHeight = 2000,
  defaultExpanded = false,
  labels,
  fade = true,
  placement = "center",
  id,
  className,
}: ExpandableContentProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [hasOverflow, setHasOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const contentId = id ?? `expandable-${reactId}`;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () =>
      setHasOverflow(el.scrollHeight > collapsedHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, collapsedHeight]);

  const showMoreLabel = labels?.showMore ?? "Show more";
  const showLessLabel = labels?.showLess ?? "Show less";

  return (
    <div className={className}>
      <div
        ref={ref}
        id={contentId}
        className={cn(
          "relative overflow-hidden transition-[max-height] duration-300 ease-out",
          !expanded &&
            hasOverflow &&
            fade &&
            "[mask-image:linear-gradient(to_bottom,black_0%,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_75%,transparent_100%)]",
        )}
        style={{ maxHeight: expanded ? expandedMaxHeight : collapsedHeight }}
      >
        {children}
      </div>

      {hasOverflow && (
        <div
          className={cn(
            "flex w-full",
            placement === "start" && "justify-start",
            placement === "center" && "justify-center",
            placement === "end" && "justify-end",
          )}
        >
          <Button
            variant="link"
            size="sm"
            nativeButton
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((v) => !v)}
            className="h-auto px-0 text-muted-foreground"
          >
            {expanded ? showLessLabel : showMoreLabel}
            {expanded ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
