import { notFound, redirect } from "next/navigation";

import { getCourseForLearning } from "@/app/data/user/get-course-for-learning";

import { LessonInfo } from "./_components/LessonInfo";
import { LessonVideo } from "./_components/LessonVideo";

interface PageParams {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonPlayerPage({ params }: PageParams) {
  const { slug, lessonId } = await params;
  const course = await getCourseForLearning({ slug });

  const lessons = course.courseChapters.flatMap((chapter) => chapter.lessons);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  if (currentIndex === -1) {
    const fallback = lessons[0];
    if (!fallback) {
      notFound();
    }
    redirect(`/dashboard/courses/${slug}/${fallback.id}`);
  }

  const currentLesson = lessons[currentIndex];
  const prevLessonId = lessons[currentIndex - 1]?.id ?? null;
  const nextLessonId = lessons[currentIndex + 1]?.id ?? null;

  return (
    <div className="space-y-4">
      <LessonVideo
        videoKey={currentLesson.videoKey}
        title={currentLesson.title}
      />

      <LessonInfo
        lessonId={currentLesson.id}
        title={currentLesson.title}
        description={currentLesson.description}
        completed={currentLesson.completed}
        courseSlug={slug}
        prevLessonId={prevLessonId}
        nextLessonId={nextLessonId}
      />
    </div>
  );
}
