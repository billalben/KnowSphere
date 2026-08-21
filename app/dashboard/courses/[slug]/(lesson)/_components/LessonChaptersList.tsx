"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleIcon,
  PlayCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type {
  tCourseForLearningChapter,
  tCourseForLearningLesson,
} from "@/app/data/user/get-course-for-learning";

interface LessonChaptersListProps {
  chapters: tCourseForLearningChapter[];
  courseSlug: string;
}

export function LessonChaptersList({
  chapters,
  courseSlug,
}: LessonChaptersListProps) {
  const pathname = usePathname();
  const currentLessonId = pathname.split("/").pop() ?? "";
  const totalLessons = useMemo(
    () => chapters.reduce((acc, ch) => acc + ch.lessons.length, 0),
    [chapters],
  );
  const completedCount = useMemo(
    () =>
      chapters.reduce(
        (acc, ch) =>
          acc + ch.lessons.filter((lesson) => lesson.completed).length,
        0,
      ),
    [chapters],
  );
  const progressValue =
    totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b p-4">
        <Progress value={progressValue} className="w-full max-w-sm">
          <ProgressLabel>Course progress</ProgressLabel>
          <ProgressValue />
        </Progress>
        <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
          {completedCount} of {totalLessons} lessons
        </p>
      </div>

      <div className="p-3">
        <ul className="flex flex-col gap-3">
          {chapters.map((chapter) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              currentLessonId={currentLessonId}
              pathname={pathname}
              courseSlug={courseSlug}
            />
          ))}
        </ul>
      </div>
    </Card>
  );
}

interface ChapterSectionProps {
  chapter: tCourseForLearningChapter;
  currentLessonId: string;
  pathname: string;
  courseSlug: string;
}

function ChapterSection({
  chapter,
  currentLessonId,
  pathname,
  courseSlug,
}: ChapterSectionProps) {
  const containsCurrent = chapter.lessons.some(
    (lesson) => lesson.id === currentLessonId,
  );
  const [open, setOpen] = useState(containsCurrent);

  const lessonCount = chapter.lessons.length;
  const lessonWord = lessonCount === 1 ? "lesson" : "lessons";

  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60">
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              !open && "-rotate-90",
            )}
            aria-hidden
          />
          <BookOpenIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="flex-1 text-sm font-medium leading-snug">
            {chapter.title}
          </span>
          <Badge variant="secondary" className="shrink-0 h-5 px-2 text-[10px]">
            {lessonCount} {lessonWord}
          </Badge>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="ml-3 mt-1 flex flex-col gap-0.5 border-l pl-3">
            {lessonCount === 0 ? (
              <li className="px-2 py-2 text-xs text-muted-foreground">
                No lessons in this chapter yet.
              </li>
            ) : (
              chapter.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  isActive={pathname.endsWith(`/${lesson.id}`)}
                  href={`/dashboard/courses/${courseSlug}/${lesson.id}`}
                />
              ))
            )}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

interface LessonRowProps {
  lesson: tCourseForLearningLesson;
  isActive: boolean;
  href: string;
}

function LessonRow({ lesson, isActive, href }: LessonRowProps) {
  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-start gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted/60",
          isActive && "bg-muted text-foreground font-medium",
        )}
      >
        <span className="mt-0.5 shrink-0">
          {isActive ? (
            <PlayCircleIcon
              className="size-4 text-primary"
              aria-hidden
              strokeWidth={2.25}
            />
          ) : (
            <CircleIcon
              className="size-4 text-muted-foreground"
              aria-hidden
              strokeWidth={2}
            />
          )}
        </span>
        <span className="flex-1 line-clamp-2 leading-snug">{lesson.title}</span>
        {lesson.completed ? (
          <CheckCircle2Icon
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
        ) : null}
      </Link>
    </li>
  );
}
