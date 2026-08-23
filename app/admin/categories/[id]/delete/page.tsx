import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import prisma from "@/lib/prisma";

import { DeleteCategoryForm } from "./_components/DeleteCategoryForm";

type Params = Promise<{ id: string }>;

export default async function DeleteCategoryPage({ params }: { params: Params }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { courses: true } },
    },
  });

  if (!category) {
    notFound();
  }

  const courseCount = category._count.courses;

  return (
    <>
      <PageHeader backHref="/admin/categories" title="Delete Category" />

      {/* Grid + min-h ensures the card is meaningfully centered in the admin
          content area even though the parent isn't a flex container. */}
      <div className="grid min-h-[60vh] place-items-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Are you sure?</CardTitle>
            <CardDescription>
              This action cannot be undone. This will permanently delete the
              category <strong>&ldquo;{category.name}&rdquo;</strong>.
              {courseCount > 0 && (
                <>
                  {" "}
                  It will be removed from{" "}
                  <strong>
                    {courseCount} course{courseCount === 1 ? "" : "s"}
                  </strong>
                  , but the courses themselves will remain.
                </>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <DeleteCategoryForm categoryId={category.id} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}