import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { EmptyState } from "@/components/general/EmptyState";
import { BookOpenIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { AdminCourseCard } from "./AdminCourseCard";

export async function CoursesList() {
  const courses = await adminGetCourses();

  if (courses.length === 0) {
    return (
      <EmptyState
        fill
        icon={BookOpenIcon}
        title="No courses yet"
        description="You haven’t created any courses yet."
        action={
          <Link href="/admin/courses/new" className={buttonVariants()}>
            Create New Course
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <AdminCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
