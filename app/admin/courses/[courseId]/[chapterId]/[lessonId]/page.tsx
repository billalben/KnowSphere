import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import { adminGetLessonQuiz } from "@/app/data/admin/admin-get-lesson-quiz";
import { PageHeader } from "@/components/admin/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LessonForm } from "./_components/LessonForm";
import { QuizEditor } from "./_components/QuizEditor";

type TPrarams = Promise<{
  courseId: string;
  chapterId: string;
  lessonId: string;
}>;

export default async function LessonPage({ params }: { params: TPrarams }) {
  const { courseId, chapterId, lessonId } = await params;
  const [lesson, quiz] = await Promise.all([
    adminGetLesson({ id: lessonId }),
    adminGetLessonQuiz({ lessonId }),
  ]);

  return (
    <div>
      <PageHeader
        backHref={`/admin/courses/${courseId}/edit`}
        title="Edit Lesson"
      />

      <Tabs defaultValue="lesson-details" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="lesson-details">Lesson Details</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="lesson-details">
          <LessonForm courseId={courseId} chapterId={chapterId} data={lesson} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizEditor lessonId={lessonId} initialQuiz={quiz} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
