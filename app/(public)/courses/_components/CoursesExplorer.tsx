"use client";

import { useMemo } from "react";
import { useQueryStates, debounce } from "nuqs";

import { type tCourse } from "@/app/data/course/get-all-courses";
import { CourseCard } from "./CourseCard";
import { CourseListRow } from "./CourseListRow";
import { useViewMode } from "../_hooks/use-view-mode";
import {
  coursesSearchParams,
  LEVEL_OPTIONS,
  SORT_OPTIONS,
  type LevelFilter,
  type SortKey,
  type ViewMode,
} from "../_lib/courses-filters";
import { EmptyState } from "@/components/general/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  FilterIcon,
  LayoutGridIcon,
  RowsIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

interface CoursesExplorerProps {
  courses: tCourse[];
}

function matchesLevel(course: tCourse, level: LevelFilter): boolean {
  if (level === "All") return true;
  return course.level === level.toUpperCase();
}

function matchesQuery(course: tCourse, q: string): boolean {
  if (!q) return true;
  return (
    course.title.toLowerCase().includes(q) ||
    course.smallDesc.toLowerCase().includes(q)
  );
}

function findLabel<T extends string>(
  options: { value: T; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function sortCourses(courses: tCourse[], sort: SortKey): tCourse[] {
  const next = [...courses];
  switch (sort) {
    case "newest":
      return next.sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime() ||
          b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    case "price-asc":
      return next.sort((a, b) => a.price - b.price);
    case "price-desc":
      return next.sort((a, b) => b.price - a.price);
    case "duration-asc":
      return next.sort((a, b) => a.duration - b.duration);
    case "duration-desc":
      return next.sort((a, b) => b.duration - a.duration);
  }
}

export function CoursesExplorer({ courses }: CoursesExplorerProps) {
  const [{ q, level, sort }, setParams] = useQueryStates(coursesSearchParams, {
    history: "replace",
    shallow: true,
  });

  const [view, setView] = useViewMode();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return courses.filter(
      (course) => matchesLevel(course, level) && matchesQuery(course, query),
    );
  }, [courses, level, q]);

  const sorted = useMemo(() => sortCourses(filtered, sort), [filtered, sort]);

  const noResults = sorted.length === 0;
  const hasFilters = q !== "" || level !== "All" || sort !== "newest";

  function handleQueryChange(value: string) {
    setParams({ q: value }, { limitUrlUpdates: debounce(300) });
  }

  function handleLevelChange(value: string | null) {
    if (value === "All" || value === null) {
      setParams({ level: null });
    } else {
      setParams({ level: value as LevelFilter });
    }
  }

  function handleSortChange(value: string | null) {
    if (value === null) {
      setParams({ sort: null });
    } else {
      setParams({ sort: value as SortKey });
    }
  }

  function resetFilters() {
    setParams({ q: null, level: null, sort: null });
  }

  function handleViewChange(value: string[]) {
    const next = value[0];
    if (next === "grid" || next === "list") setView(next as ViewMode);
  }

  function renderClearFiltersAction() {
    if (!hasFilters) return null;
    return (
      <Button variant="outline" onClick={resetFilters}>
        Clear filters
      </Button>
    );
  }

  function renderResults() {
    if (noResults) {
      return (
        <EmptyState
          icon={SearchIcon}
          title="No courses match your filters"
          description="Try adjusting your search or level filter to see more results."
          action={renderClearFiltersAction()}
        />
      );
    }

    if (view === "grid") {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {sorted.map((course) => (
          <CourseListRow key={course.id} course={course} />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpenIcon}
        title="No courses published yet"
        description="We're working on new courses. Check back soon to start learning."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search courses by title or description..."
            className="pl-9"
            aria-label="Search courses"
          />
          {q && (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterIcon
            className={cn(
              "size-4 transition-colors",
              hasFilters
                ? "fill-foreground text-foreground"
                : "text-muted-foreground",
            )}
            aria-hidden
          />

          <Select
            value={level}
            onValueChange={handleLevelChange}
          >
            <SelectTrigger className="w-40" aria-label="Filter by level">
              <SelectValue>
                {(value) => findLabel(LEVEL_OPTIONS, value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-56" aria-label="Sort courses">
              <SelectValue>
                {(value) => findLabel(SORT_OPTIONS, value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleGroup
            value={[view]}
            onValueChange={handleViewChange}
            variant="outline"
            spacing={0}
            aria-label="View mode"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGridIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <RowsIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing{" "}
          <span className="font-medium text-foreground tabular-nums">
            {sorted.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground tabular-nums">
            {courses.length}
          </span>{" "}
          {courses.length === 1 ? "course" : "courses"}
        </p>
      </div>

      {renderResults()}
    </div>
  );
}
