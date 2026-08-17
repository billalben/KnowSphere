import { parseAsString, parseAsStringLiteral } from "nuqs";

export const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
export const SORTS = [
  "newest",
  "price-asc",
  "price-desc",
  "duration-asc",
  "duration-desc",
] as const;
export const VIEWS = ["grid", "list"] as const;

export type LevelFilter = (typeof LEVELS)[number];
export type SortKey = (typeof SORTS)[number];
export type ViewMode = (typeof VIEWS)[number];

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "duration-asc": "Duration: short to long",
  "duration-desc": "Duration: long to short",
};

export const LEVEL_OPTIONS = LEVELS.map((value) => ({
  value,
  label: value === "All" ? "All levels" : value,
}));

export const SORT_OPTIONS = SORTS.map((value) => ({
  value,
  label: SORT_LABELS[value],
}));

export const coursesSearchParams = {
  q: parseAsString.withDefault(""),
  level: parseAsStringLiteral(LEVELS).withDefault("All"),
  sort: parseAsStringLiteral(SORTS).withDefault("newest"),
};

export const DEFAULT_VIEW: ViewMode = "grid";
