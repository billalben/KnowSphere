import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { PageHeader } from "@/components/admin/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditCourseForm } from "./_components/EditCourseForm";
import { EditCourseStructureForm } from "./_components/EditCourseStructureForm";

type Params = Promise<{ courseId: string }>;

export default async function EditCoursePage({ params }: { params: Params }) {
  const { courseId } = await params;
  const course = await adminGetCourse(courseId);

  return (
    <div>
      <PageHeader backHref="/admin/courses" title="Edit Course" />

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <EditCourseForm courseId={courseId} course={course} />
        </TabsContent>

        <TabsContent value="course-structure">
          <EditCourseStructureForm course={course} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
