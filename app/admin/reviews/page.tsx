import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";

import { ReviewsList } from "./_components/ReviewsList";
import { ReviewsListSkeleton } from "./_components/ReviewsListSkeleton";

export default function ReviewsPage() {
  return (
    <>
      <PageHeader title="Course Reviews" />

      <Suspense fallback={<ReviewsListSkeleton />}>
        <ReviewsList />
      </Suspense>
    </>
  );
}
