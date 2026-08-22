import { notFound, redirect } from "next/navigation";

import { getCourseForLearning } from "@/app/data/user/get-course-for-learning";
import { getLessonComments } from "@/app/data/user/get-lesson-comments";
import { getLessonQuizForUser } from "@/app/data/user/get-lesson-quiz";
import { requireUser } from "@/app/data/user/require-user";
import { COMMENT_PAGE_SIZE } from "@/lib/constants/comments";

import { LessonInfo } from "./_components/LessonInfo";
import { LessonQuizSection } from "./_components/LessonQuizSection";
import { LessonVideo } from "./_components/LessonVideo";
import { CommentsSection } from "./_components/comments/CommentsSection";

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

  const session = await requireUser();
  const [initialComments, quiz] = await Promise.all([
    getLessonComments({
      lessonId: currentLesson.id,
      viewerId: session.user.id,
      page: 1,
      pageSize: COMMENT_PAGE_SIZE,
      sort: "oldest",
    }),
    getLessonQuizForUser({ lessonId: currentLesson.id }),
  ]);

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

      {quiz ? <LessonQuizSection quiz={quiz} /> : null}

      <CommentsSection
        lessonId={currentLesson.id}
        initialPage={initialComments}
        currentUserId={session.user.id}
        currentUserRole={session.user.role ?? null}
      />
    </div>
  );
}
