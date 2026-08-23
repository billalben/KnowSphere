"use client";

import * as React from "react";
import { CheckIcon, PlusIcon, TagIcon } from "lucide-react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

import { MAX_CATEGORIES } from "@/lib/constants/categories";

import type { tCategoryOption } from "@/app/data/admin/admin-get-category-options";

type CategoryMultiSelectProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: tCategoryOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const CREATE_PREFIX = "__create__:";

function isCreateValue(value: string): boolean {
  return value.startsWith(CREATE_PREFIX);
}

function fromCreateValue(value: string): string {
  return value.slice(CREATE_PREFIX.length);
}

// Layout constants used by the overflow measurement (px).
const PADDING_X = 12;
const CHIP_GAP = 6;
const INPUT_RESERVE_FIRST = 90; // input takes more space when it's the only thing
const INPUT_RESERVE_REST = 60; // once a chip is present, input can shrink more
const INDICATOR_WIDTH = 36;

export function CategoryMultiSelect({
  value,
  onChange,
  options,
  placeholder = "Select or create categories",
  disabled = false,
  className,
}: CategoryMultiSelectProps) {
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = React.useState("");
  // `Infinity` lets every chip render on first paint so the measurement row has
  // refs to read; useLayoutEffect then narrows it to what actually fits.
  const [visibleCount, setVisibleCount] = React.useState<number>(Infinity);
  const chipRefs = React.useRef<(HTMLElement | null)[]>([]);

  const trimmedInput = inputValue.trim();
  const exactMatch =
    trimmedInput.length > 0 &&
    options.some((o) => o.name.toLowerCase() === trimmedInput.toLowerCase());

  const atCap = options.length >= MAX_CATEGORIES;
  const showCreate =
    trimmedInput.length >= 2 && !exactMatch && !atCap && !disabled;

  const items: string[] = React.useMemo(() => {
    const base = options.map((o) => o.name);
    return showCreate ? [...base, `${CREATE_PREFIX}${trimmedInput}`] : base;
  }, [options, showCreate, trimmedInput]);

  const handleValueChange = (next: string[]) => {
    const normalized: string[] = [];
    for (const item of next) {
      if (isCreateValue(item)) {
        const raw = fromCreateValue(item).trim();
        if (!raw) continue;
        if (normalized.some((n) => n.toLowerCase() === raw.toLowerCase())) continue;
        normalized.push(raw);
      } else {
        if (normalized.some((n) => n.toLowerCase() === item.toLowerCase())) continue;
        normalized.push(item);
      }
    }
    onChange(normalized);
    setInputValue("");
  };

  React.useLayoutEffect(() => {
    // Keep ref-slot length in sync with the value so any index can be measured.
    // Runs before the measurement effect below (effects fire in declaration order).
    chipRefs.current.length = value.length;
  }, [value]);

  React.useLayoutEffect(() => {
    const container = anchor.current;
    if (!container) return;

    const compute = () => {
      if (value.length === 0) {
        setVisibleCount(0);
        return;
      }

      const availableWidth = container.clientWidth - PADDING_X * 2;
      let used = 0;
      let count = 0;

      for (let i = 0; i < value.length; i++) {
        const chipEl = chipRefs.current[i];
        if (!chipEl) break;
        const chipWidth = chipEl.offsetWidth + CHIP_GAP;
        const remainingAfter = value.length - i - 1;
        const wouldShowIndicator = remainingAfter > 0 && count > 0;
        const indicatorSpace = wouldShowIndicator
          ? INDICATOR_WIDTH + CHIP_GAP
          : 0;
        const inputSpace = count === 0 ? INPUT_RESERVE_FIRST : INPUT_RESERVE_REST;

        if (used + chipWidth + indicatorSpace + inputSpace > availableWidth) {
          break;
        }

        used += chipWidth;
        count = i + 1;
      }

      // Always show at least one chip so the user sees what they've added.
      setVisibleCount(Math.max(value.length > 0 ? 1 : 0, count));
    };

    compute();

    const observer = new ResizeObserver(compute);
    observer.observe(container);
    return () => observer.disconnect();
  }, [value, anchor]);

  const effectiveVisible =
    visibleCount === Infinity ? value.length : visibleCount;
  const overflow = value.length - effectiveVisible;

  return (
    <Combobox
      multiple
      items={items}
      value={value}
      onValueChange={handleValueChange}
      inputValue={inputValue}
      onInputValueChange={(v: string) => setInputValue(v)}
      disabled={disabled}
    >
      <ComboboxChips
        ref={anchor}
        className={cn(
          "w-full min-h-9 px-1.5 py-1.5",
          value.length > 0 && "pl-2",
          className,
        )}
      >
        {/* Hidden measurement row — every chip is rendered here so we can read
            offsetWidth, but it takes no visible space. We deliberately use a
            plain <span> here (not ComboboxChip) so base-ui's chip tracking
            doesn't get confused by duplicate chips in the DOM, which would
            break the X-button removal on the visible chips. */}
        <div
          aria-hidden
          className="invisible pointer-events-none"
          style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, overflow: "hidden" }}
        >
          {value.map((name, i) => (
            <span
              key={`measure-${name}`}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              className="inline-flex h-[calc(--spacing(5.5))] w-fit items-center gap-1 rounded-sm bg-primary/10 pl-1.5 pr-0 text-xs font-medium whitespace-nowrap"
            >
              <TagIcon className="size-3 text-primary" />
              <span>{name}</span>
              {/* Spacer approximating the X-button width so the measurement
                  closely matches the real chip width. */}
              <span aria-hidden style={{ display: "inline-block", width: 18 }} />
            </span>
          ))}
        </div>

        {/* Visible chips (capped at the count that fits on a single row). */}
        {value.slice(0, effectiveVisible).map((name) => (
          <ComboboxChip key={name} className="bg-primary/10">
            <TagIcon className="size-3 text-primary" />
            <span>{name}</span>
          </ComboboxChip>
        ))}

        {/* "+N" indicator when some chips don't fit. */}
        {overflow > 0 && (
          <span
            aria-label={`${overflow} more ${overflow === 1 ? "category" : "categories"}`}
            className="inline-flex h-[calc(--spacing(5.5))] items-center rounded-sm bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground"
          >
            +{overflow}
          </span>
        )}

        <ComboboxChipsInput
          placeholder={value.length === 0 ? placeholder : ""}
          aria-label="Categories"
        />
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          <ComboboxCollection>
            {(item: string) => {
              if (isCreateValue(item)) {
                return (
                  <ComboboxItem key={item} value={item} className="font-medium">
                    <PlusIcon className="text-primary" />
                    <span>
                      Create <strong>{fromCreateValue(item)}</strong>
                    </span>
                    <CheckIcon className="ml-auto opacity-0" />
                  </ComboboxItem>
                );
              }
              return (
                <ComboboxItem key={item} value={item}>
                  <TagIcon className="text-muted-foreground" />
                  <span>{item}</span>
                </ComboboxItem>
              );
            }}
          </ComboboxCollection>
          <ComboboxEmpty>No matching categories.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}