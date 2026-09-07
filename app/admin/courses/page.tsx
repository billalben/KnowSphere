import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { CoursesList } from "./_components/CoursesList";
import { CoursesListSkeleton } from "./_components/CoursesListSkeleton";
import { CleanupOrphansButton } from "./_components/CleanupOrphansButton";

export default function CoursesPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <div className="flex items-center gap-2">
          <CleanupOrphansButton />
          <Link href="/admin/courses/new" className={buttonVariants()}>
            Create New Course
          </Link>
        </div>
      </div>

      <Suspense fallback={<CoursesListSkeleton />}>
        <CoursesList />
      </Suspense>
    </>
  );
}
