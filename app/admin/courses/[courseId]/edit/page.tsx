import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { adminGetCategoryOptions } from "@/app/data/admin/admin-get-category-options";
import { PageHeader } from "@/components/admin/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditCourseForm } from "./_components/EditCourseForm";
import { EditCourseStructureForm } from "./_components/EditCourseStructureForm";
import NewChapterModal from "./_components/NewChapterModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Params = Promise<{ courseId: string }>;

export default async function EditCoursePage({ params }: { params: Params }) {
  const { courseId } = await params;
  const [course, categoryOptions] = await Promise.all([
    adminGetCourse(courseId),
    adminGetCategoryOptions(),
  ]);

  return (
    <div>
      <PageHeader backHref="/admin/courses" title="Edit Course" />

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <EditCourseForm
            courseId={courseId}
            course={course}
            categoryOptions={categoryOptions}
          />
        </TabsContent>

        <TabsContent value="course-structure">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Course Structure</CardTitle>
              <NewChapterModal courseId={course.id} />
            </CardHeader>
            <CardContent>
              <EditCourseStructureForm course={course} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
