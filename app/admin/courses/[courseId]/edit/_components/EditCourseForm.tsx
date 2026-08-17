"use client";

import {
  CourseForm,
  type CourseFormProps,
} from "../../../_components/CourseForm";
import { updateCourse } from "../actions";
import type { CourseSchemaType } from "@/lib/zodSchemas";
import type { tAdminGetCourse } from "@/app/data/admin/admin-get-course";

type EditCourseFormProps = {
  courseId: string;
  course: tAdminGetCourse;
};

export function EditCourseForm({ courseId, course }: EditCourseFormProps) {
  const submitAction: CourseFormProps["submitAction"] = (data) =>
    updateCourse(courseId, data);

  return (
    <CourseForm
      initialValues={{
        title: course.title,
        description: course.description ?? "",
        smallDesc: course.smallDesc,
        fileKey: course.fileKey,
        price: course.price,
        duration: course.duration,
        level: course.level as CourseSchemaType["level"],
        status: course.status as CourseSchemaType["status"],
        slug: course.slug,
        category: course.category ?? "",
      }}
      submitAction={submitAction}
      submitLabel="Save Changes"
      pendingLabel="Saving..."
      successVerb="updated"
      successDescription="Your course has been updated."
      redirectTo="/admin/courses"
      showReset={false}
    />
  );
}
