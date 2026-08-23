import { getMyEnrolledCourses } from "@/app/data/user/get-my-enrolled-courses";

import { EnrolledCoursesList } from "./_components/EnrolledCoursesList";

export const metadata = {
  title: "My Learning | KnowSphere",
  description: "Pick up where you left off.",
};

export default async function DashboardPage() {
  const courses = await getMyEnrolledCourses();

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">My Learning</h2>
        <p className="text-sm text-muted-foreground">
          Pick up where you left off, or explore new courses.
        </p>
      </div>

      <EnrolledCoursesList courses={courses} />
    </div>
  );
}
