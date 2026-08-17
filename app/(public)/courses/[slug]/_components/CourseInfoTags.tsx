import { Badge } from "@/components/ui/badge";
import { type tCourseDetail } from "@/app/data/course/get-course-by-slug";
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  GraduationCapIcon,
  PlayCircleIcon,
  TagIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { formatDate, formatDuration } from "../_lib/format-duration";

interface CourseInfoTagsProps {
  course: tCourseDetail;
  totalLessons: number;
  className?: string;
}

const levelStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  INTERMEDIATE: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  ADVANCED: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function CourseInfoTags({
  course,
  totalLessons,
  className,
}: CourseInfoTagsProps) {
  const levelLabel =
    course.level.charAt(0) + course.level.slice(1).toLowerCase();
  const chaptersCount = course.courseChapters.length;

  const tags = [
    {
      key: "level",
      icon: GraduationCapIcon,
      label: levelLabel,
      className: levelStyles[course.level] ?? undefined,
    },
    {
      key: "duration",
      icon: ClockIcon,
      label: formatDuration(course.duration),
    },
    {
      key: "category",
      icon: TagIcon,
      label: course.category ?? "Uncategorized",
    },
    {
      key: "chapters",
      icon: BookOpenIcon,
      label: `${chaptersCount} ${chaptersCount === 1 ? "chapter" : "chapters"}`,
    },
    {
      key: "lessons",
      icon: PlayCircleIcon,
      label: `${totalLessons} ${totalLessons === 1 ? "lesson" : "lessons"}`,
    },
    {
      key: "updated",
      icon: CalendarIcon,
      label: `Updated ${formatDate(course.updatedAt)}`,
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Badge
          key={tag.key}
          variant="secondary"
          className={cn("gap-1.5", tag.className)}
        >
          <tag.icon className="size-3" />
          {tag.label}
        </Badge>
      ))}
    </div>
  );
}
