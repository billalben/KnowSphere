import { PageHeader } from "@/components/admin/page-header";
import { CourseForm } from "../_components/CourseForm";
import { adminGetCategoryOptions } from "@/app/data/admin/admin-get-category-options";
import { createCourse } from "./actions";

export default async function NewCoursePage() {
  const categoryOptions = await adminGetCategoryOptions();

  return (
    <>
      <PageHeader backHref="/admin/courses" title="Create New Course" />

      <CourseForm
        submitAction={createCourse}
        categoryOptions={categoryOptions}
        submitLabel="Create Course"
        pendingLabel="Creating..."
        successVerb="created"
        successDescription="Your course has been created."
        redirectTo="/admin/courses"
        fireConfetti
      />
    </>
  );
}
