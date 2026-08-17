import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteCourseForm } from "./_components/DeleteCourseForm";

type Params = Promise<{ courseId: string }>;

export default async function DeleteCoursePage({ params }: { params: Params }) {
  const { courseId } = await params;
  const course = await adminGetCourse(courseId);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        backHref={`/admin/courses/${courseId}/edit`}
        title="Delete Course"
      />

      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Are you sure?</CardTitle>
            <CardDescription>
              This action cannot be undone. This will permanently delete the
              course <strong>&ldquo;{course.title}&rdquo;</strong>, including all
              chapters and lessons.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <DeleteCourseForm courseId={courseId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}