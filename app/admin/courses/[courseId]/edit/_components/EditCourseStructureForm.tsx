"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GripVertical,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { tryCatch } from "@/hooks/try-catch";
import { cn } from "@/lib/utils";
import { tAdminGetCourse } from "@/app/data/admin/admin-get-course";
import { reorderChapters, reorderLessons } from "../actions";
import type { tApiResponse } from "@/types/api";
import NewLessonModal from "./NewLessonModal";
import DeleteLessonModal from "./DeleteLessonModal";
import DeleteChapterModal from "./DeleteChapterModal";

type EditCourseStructureFormProps = {
  course: tAdminGetCourse;
};

type Lesson = { id: string; title: string; position: number };
type Chapter = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

function SortableLesson({
  lesson,
  index,
  courseId,
  chapterId,
}: {
  lesson: Lesson;
  index: number;
  courseId: string;
  chapterId: string;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: lesson.id,
    index,
  });

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm",
        isDragging && "opacity-50",
      )}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label="Drag lesson"
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1 truncate">
        <Link
          href={`/admin/courses/${courseId}/${chapterId}/${lesson.id}`}
          className="flex items-center gap-2 hover:text-primary"
        >
          <PlayCircle className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{lesson.title}</span>
        </Link>
      </span>

      <DeleteLessonModal
        lessonId={lesson.id}
        courseId={courseId}
        chapterId={chapterId}
      />
    </li>
  );
}

function SortableChapter({
  courseId,
  chapter,
  index,
  onReorderLessons,
}: {
  courseId: string;
  chapter: Chapter;
  index: number;
  onReorderLessons: (chapterId: string, next: Lesson[]) => void;
  isReorderingLessons: boolean;
}) {
  const [open, setOpen] = useState(true);
  const { ref, handleRef, isDragging } = useSortable({
    id: chapter.id,
    index,
  });

  return (
    <div ref={ref} className={cn(isDragging && "opacity-50")}>
      <Card size="sm">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              ref={handleRef}
              type="button"
              aria-label="Drag chapter"
              className="cursor-grab text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="size-4" />
            </button>

            <CollapsibleTrigger className="flex flex-1 items-center gap-1.5 text-left">
              {open ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
              <BookOpen className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium">{chapter.title}</span>
              <span className="ml-1 text-xs text-muted-foreground">
                ({chapter.lessons.length} lessons)
              </span>
            </CollapsibleTrigger>

            <DeleteChapterModal courseId={courseId} chapterId={chapter.id} />
          </div>

          <CollapsibleContent>
            <div className="border-t border-border px-4 py-3">
              <DragDropProvider
                onDragEnd={(event) => {
                  if (event.canceled) return;
                  const source = event.operation.source;
                  if (!isSortable(source)) return;

                  const { initialIndex, index: newIndex } = source;
                  if (initialIndex === newIndex) return;

                  const next = [...chapter.lessons];
                  const [removed] = next.splice(initialIndex, 1);
                  next.splice(newIndex, 0, removed);
                  onReorderLessons(chapter.id, next);
                }}
              >
                <ul className="flex flex-col gap-2">
                  {chapter.lessons.map((lesson, i) => (
                    <SortableLesson
                      key={lesson.id}
                      index={i}
                      courseId={courseId}
                      chapterId={chapter.id}
                      lesson={lesson}
                    />
                  ))}
                </ul>
              </DragDropProvider>

              <NewLessonModal courseId={courseId} chapterId={chapter.id} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

export function EditCourseStructureForm({
  course,
}: EditCourseStructureFormProps) {
  const chaptersFromCourse = useMemo<Chapter[]>(
    () =>
      course.courseChapters?.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        position: chapter.position,
        lessons:
          chapter.lessons?.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            position: lesson.position,
          })) ?? [],
      })) ?? [],
    [course],
  );

  const [chapters, setChapters] = useState<Chapter[]>(chaptersFromCourse);

  // Sync local state when the server-fetched course changes (e.g. after the
  // modals below call router.refresh() on a create/delete, or after a reorder
  // round-trip). useState only consumes the initial value on mount, so without
  // this the list would stay stale until a full page reload.
  useEffect(() => {
    setChapters(chaptersFromCourse);
  }, [chaptersFromCourse]);

  const [, startChapterReorder] = useTransition();
  const [, startLessonReorder] = useTransition();
  const [reorderingLessonChapterId, setReorderingLessonChapterId] = useState<
    string | null
  >(null);

  const handleReorderChapters = (next: Chapter[]) => {
    setChapters(next);
    startChapterReorder(async () => {
      const { data: result, error } = await tryCatch(
        reorderChapters({
          courseId: course.id,
          chapters: next.map((c, i) => ({ id: c.id, position: i + 1 })),
        }),
      );

      if (error) {
        toast.error("Failed to reorder chapters");
        return;
      }

      if ((result as tApiResponse<unknown>)?.status === "error") {
        toast.error((result as tApiResponse<unknown>).message);
        return;
      }
    });
  };

  const handleReorderLessons = (chapterId: string, next: Lesson[]) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: next.map((l, i) => ({ ...l, position: i + 1 })),
            }
          : c,
      ),
    );
    setReorderingLessonChapterId(chapterId);
    startLessonReorder(async () => {
      const { data: result, error } = await tryCatch(
        reorderLessons({
          courseId: course.id,
          chapterId,
          lessons: next.map((l, i) => ({ id: l.id, position: i + 1 })),
        }),
      );
      setReorderingLessonChapterId(null);

      if (error) {
        toast.error("Failed to reorder lessons");
        return;
      }

      if ((result as tApiResponse<unknown>)?.status === "error") {
        toast.error((result as tApiResponse<unknown>).message);
        return;
      }
    });
  };

  return (
    <div className="space-y-3">
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;
          const source = event.operation.source;
          if (!isSortable(source)) return;

          const { initialIndex, index: newIndex } = source;
          if (initialIndex === newIndex) return;

          const next = [...chapters];
          const [removed] = next.splice(initialIndex, 1);
          next.splice(newIndex, 0, removed);
          handleReorderChapters(next);
        }}
      >
        {chapters.map((chapter, index) => (
          <SortableChapter
            key={chapter.id}
            courseId={course.id}
            chapter={chapter}
            index={index}
            onReorderLessons={handleReorderLessons}
            isReorderingLessons={reorderingLessonChapterId === chapter.id}
          />
        ))}
      </DragDropProvider>
    </div>
  );
}
