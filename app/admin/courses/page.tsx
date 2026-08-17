import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { CoursesList } from "./_components/CoursesList";
import { CoursesListSkeleton } from "./_components/CoursesListSkeleton";

export default function CoursesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <Link href="/admin/courses/new" className={buttonVariants()}>
          Create New Course
        </Link>
      </div>

      <Suspense fallback={<CoursesListSkeleton />}>
        <CoursesList />
      </Suspense>
    </>
  );
}
