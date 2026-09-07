export type FieldChangeKind = "scalar" | "array" | "length";

export type ScalarChange = {
  kind: "scalar";
  label: string;
  from: unknown;
  to: unknown;
};

export type ArrayChange = {
  kind: "array";
  label: string;
  added: unknown[];
  removed: unknown[];
};

export type LengthChange = {
  kind: "length";
  label: string;
  fromLength: number;
  toLength: number;
};

export type FieldChange = ScalarChange | ArrayChange | LengthChange;

export type ChangesByField = Record<string, FieldChange>;

export type FieldDescriptor<T> = {
  /** Logical key written to the metadata `fields` map. */
  key: string;
  /** Human label rendered in the activity row chip. */
  label: string;
  /** Pick the value of this field out of the entity row. */
  pick: (row: T) => unknown;
  /**
   * Compare two values for this field. Defaults to a stable deep-equal that
   * sorts arrays before comparison (so `{a,b,c}` and `{c,b,a}` are equal).
   * Override for custom diffing (e.g. snapshotting the length of a long string).
   */
  compare?: (a: unknown, b: unknown) => boolean;
};

const DEFAULT_LONG_STRING_THRESHOLD = 160;

function stableJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableJson).sort(compareStability);
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = stableJson((value as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return value;
}

function compareStability(a: unknown, b: unknown): number {
  const sa = JSON.stringify(stableJson(a));
  const sb = JSON.stringify(stableJson(b));
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
}

function defaultEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return JSON.stringify(stableJson(a)) === JSON.stringify(stableJson(b));
}

function isPlainArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function toSortedCopy<T>(arr: T[]): T[] {
  return [...arr].sort(compareStability);
}

function arrayDiff(before: unknown[], after: unknown[]) {
  const beforeSet = new Set(toSortedCopy(before).map((v) => JSON.stringify(v)));
  const afterSet = new Set(toSortedCopy(after).map((v) => JSON.stringify(v)));
  const added: unknown[] = [];
  const removed: unknown[] = [];
  for (const v of afterSet) {
    if (!beforeSet.has(v)) added.push(JSON.parse(v));
  }
  for (const v of beforeSet) {
    if (!afterSet.has(v)) removed.push(JSON.parse(v));
  }
  return {
    added: toSortedCopy(added),
    removed: toSortedCopy(removed),
  };
}

/**
 * Build a normalized per-field diff between two entity snapshots.
 *
 * Fields are described by `FieldDescriptor`s so callers decide which columns to
 * audit and how to extract them — never use this on a raw row or you'll
 * accidentally diff `createdAt`/`updatedAt`.
 *
 * The returned shape is intentionally compatible with the reader (`{fields: {...}}`):
 *   metadata: { fields: buildChanges(before, after, FIELDS) }
 *
 * Change kinds produced:
 *   - "scalar" — primitive equality diff (boolean, number, string ≤ threshold).
 *   - "array"  — set-based added/removed comparison (sorted, order-independent).
 *   - "length" — long strings render a length-only summary to keep rows scannable.
 */
export function buildChanges<T>(
  before: T | null | undefined,
  after: T,
  fields: ReadonlyArray<FieldDescriptor<T>>,
  options: { longStringThreshold?: number } = {},
): ChangesByField {
  if (!before) return {};
  const threshold =
    options.longStringThreshold ?? DEFAULT_LONG_STRING_THRESHOLD;
  const out: ChangesByField = {};

  for (const field of fields) {
    const a = field.pick(before);
    const b = field.pick(after);
    const equals = field.compare ?? defaultEquals;
    if (equals(a, b)) continue;

    if (isPlainArray(a) && isPlainArray(b)) {
      const { added, removed } = arrayDiff(a, b);
      // If only order changed, defaultEquals already returned true and we
      // skipped — so any diff reaching here is a real membership change.
      const net = added.length === 0 && removed.length === 0;
      if (net) continue;
      out[field.key] = {
        kind: "array",
        label: field.label,
        added,
        removed,
      };
      continue;
    }

    if (
      typeof threshold === "number" &&
      threshold > 0 &&
      typeof a === "string" &&
      typeof b === "string" &&
      (a.length > threshold || b.length > threshold)
    ) {
      out[field.key] = {
        kind: "length",
        label: field.label,
        fromLength: a.length,
        toLength: b.length,
      };
      continue;
    }

    out[field.key] = {
      kind: "scalar",
      label: field.label,
      from: a,
      to: b,
    };
  }

  return out;
}

/**
 * Render a single field value for chip display.
 *   - strings: as-is (truncated to 60 chars)
 *   - numbers/booleans: String(v)
 *   - arrays: comma-joined (truncated, count suffix)
 *   - other: JSON.stringify with truncation
 */
export function formatFieldValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return truncate(v, 60);
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    const rendered = v.map(formatFieldValue).join(", ");
    return truncate(rendered, 60);
  }
  try {
    return truncate(JSON.stringify(v), 60);
  } catch {
    return String(v);
  }
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}
