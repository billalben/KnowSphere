import { PageHeader } from "@/components/admin/page-header";
import { CourseForm } from "../_components/CourseForm";
import { createCourse } from "./actions";

export default function NewCoursePage() {
  return (
    <>
      <PageHeader backHref="/admin/courses" title="Create New Course" />

      <CourseForm
        submitAction={createCourse}
        submitLabel="Create Course"
        pendingLabel="Creating..."
        successVerb="created"
        successDescription="Your course has been created."
        redirectTo="/admin/courses"
      />
    </>
  );
}
