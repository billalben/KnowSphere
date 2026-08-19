import { type Metadata } from "next";

import { getCourseBySlug } from "@/app/data/course/get-course-by-slug";
import { checkIfCourseBought } from "@/app/data/user/user-is-enrolled";
import { getOptionalSession } from "@/app/(public)/_lib/get-optional-session";
import { CoverImage } from "./_components/CoverImage";
import { CourseCurriculum } from "./_components/CourseCurriculum";
import { CourseHeader } from "./_components/CourseHeader";
import { CourseInfoTags } from "./_components/CourseInfoTags";
import { CourseSummaryCard } from "./_components/CourseSummaryCard";
import { DescriptionSection } from "./_components/DescriptionSection";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return {
    title: `${course.title} | KnowSphere`,
    description: course.smallDesc,
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  const [session, isEnrolled] = await Promise.all([
    getOptionalSession(),
    checkIfCourseBought({ courseId: course.id }),
  ]);
  const isSignedIn = !!session?.user;

  const totalLessons = course.courseChapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0,
  );

  return (
    <div className="pt-24 lg:pt-32 pb-12 lg:pb-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 lg:gap-12">
        <div className="lg:col-span-6 space-y-8">
          <CoverImage fileKey={course.fileKey} title={course.title} />

          <CourseHeader title={course.title} smallDesc={course.smallDesc} />

          <CourseInfoTags course={course} totalLessons={totalLessons} />

          <DescriptionSection description={course.description} />

          <CourseCurriculum chapters={course.courseChapters} />
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <CourseSummaryCard
            course={course}
            totalLessons={totalLessons}
            slug={slug}
            isEnrolled={isEnrolled}
            isSignedIn={isSignedIn}
          />
        </aside>
      </div>
    </div>
  );
}
