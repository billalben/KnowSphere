import { VideoIcon } from "lucide-react";

import { EmptyState } from "@/components/general/EmptyState";
import { getCourseForLearning } from "@/app/data/user/get-course-for-learning";

import { CourseOverviewHeader } from "./_components/CourseOverviewHeader";
import { DashboardCourseChapters } from "./_components/DashboardCourseChapters";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function CourseLearnOverviewPage({ params }: PageParams) {
  const { slug } = await params;
  const course = await getCourseForLearning({ slug });

  const totalLessons = course.courseChapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0,
  );
  const firstLessonId = course.courseChapters[0]?.lessons[0]?.id ?? null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 pb-12">
      <CourseOverviewHeader
        slug={course.slug}
        title={course.title}
        smallDesc={course.smallDesc}
        fileKey={course.fileKey}
        firstLessonId={firstLessonId}
      />

      {totalLessons === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="Course content coming soon"
          description="The instructor is still building this course. Check back later."
        />
      ) : (
        <DashboardCourseChapters
          chapters={course.courseChapters}
          courseSlug={course.slug}
        />
      )}
    </div>
  );
}
