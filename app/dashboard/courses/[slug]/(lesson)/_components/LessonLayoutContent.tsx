import type { ReactNode } from "react";

import { getCourseForLearning } from "@/app/data/user/get-course-for-learning";

import { LessonChaptersList } from "./LessonChaptersList";
import { PlayerHeader } from "./PlayerHeader";

interface LessonLayoutContentProps {
  children: ReactNode;
  slug: string;
}

export async function LessonLayoutContent({
  children,
  slug,
}: LessonLayoutContentProps) {
  const course = await getCourseForLearning({ slug });

  return (
    <>
      <PlayerHeader courseSlug={course.slug} courseTitle={course.title} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-4">{children}</div>

        <aside className="lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100svh_-_var(--header-height)_-_var(--spacing)*12)] lg:overflow-y-auto">
          <LessonChaptersList
            chapters={course.courseChapters}
            courseSlug={course.slug}
          />
        </aside>
      </div>
    </>
  );
}
