import { Suspense } from "react";

import { LessonLayoutContent } from "./_components/LessonLayoutContent";
import { LessonLayoutSkeleton } from "./_components/LessonLayoutSkeleton";

interface LessonLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function LessonLayout({
  children,
  params,
}: LessonLayoutProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LessonLayoutSkeleton />}>
      <LessonLayoutContent slug={slug}>{children}</LessonLayoutContent>
    </Suspense>
  );
}
