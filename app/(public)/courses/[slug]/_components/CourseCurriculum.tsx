"use client";

import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/general/EmptyState";
import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlayCircleIcon,
} from "lucide-react";

import { type tCourseDetail } from "@/app/data/course/get-course-by-slug";

interface CourseCurriculumProps {
  chapters: tCourseDetail["courseChapters"];
}

interface ChapterItemProps {
  chapter: tCourseDetail["courseChapters"][number];
  defaultOpen: boolean;
}

function LessonRow({
  lesson,
  index,
}: {
  lesson: tCourseDetail["courseChapters"][number]["lessons"][number];
  index: number;
}) {
  return (
    <li className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground tabular-nums">
        {index + 1}
      </span>
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium leading-snug">{lesson.title}</span>
        <span className="text-xs text-muted-foreground">
          Lesson {index + 1}
        </span>
      </div>
      <PlayCircleIcon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </li>
  );
}

function ChapterItem({ chapter, defaultOpen }: ChapterItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const lessonCount = chapter.lessons.length;
  const lessonWord = lessonCount === 1 ? "lesson" : "lessons";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card size="sm" className="overflow-hidden p-0">
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
          )}
        >
          {open ? (
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
          )}
          <BookOpenIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="flex-1 font-medium text-sm sm:text-base">
            {chapter.title}
          </span>
          <Badge variant="secondary" className="shrink-0">
            {lessonCount} {lessonWord}
          </Badge>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-2 py-2 sm:px-3">
            {lessonCount === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No lessons in this chapter yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {chapter.lessons.map((lesson, idx) => (
                  <LessonRow key={lesson.id} lesson={lesson} index={idx} />
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function CourseCurriculum({ chapters }: CourseCurriculumProps) {
  if (chapters.length === 0) {
    return (
      <EmptyState
        icon={BookOpenIcon}
        title="Curriculum coming soon"
        description="The instructor is still building out this course. Check back later."
      />
    );
  }

  const totalLessons = chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0,
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          Curriculum
        </h2>
        <p className="text-sm text-muted-foreground">
          {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"} •{" "}
          {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
        </p>
      </header>

      <div className="space-y-4">
        {chapters.map((chapter, idx) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            defaultOpen={idx === 0}
          />
        ))}
      </div>
    </div>
  );
}
