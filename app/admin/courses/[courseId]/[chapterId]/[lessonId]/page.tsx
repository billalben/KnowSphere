import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import { PageHeader } from "@/components/admin/page-header";
import { LessonForm } from "./_components/LessonForm";

type TPrarams = Promise<{
  courseId: string;
  chapterId: string;
  lessonId: string;
}>;

export default async function LessonPage({ params }: { params: TPrarams }) {
  const { courseId, chapterId, lessonId } = await params;
  const lesson = await adminGetLesson({ id: lessonId });

  return (
    <div>
      <PageHeader
        backHref={`/admin/courses/${courseId}/edit`}
        title="Edit Lesson"
      />
      <LessonForm courseId={courseId} chapterId={chapterId} data={lesson} />
    </div>
  );
}
