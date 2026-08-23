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

import { CategoryForm } from "../../_components/CategoryForm";

type Params = Promise<{ id: string }>;

export default async function EditCategoryPage({ params }: { params: Params }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader backHref="/admin/categories" title="Edit Category" />

      <div className="flex flex-1 justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Rename category</CardTitle>
            <CardDescription>
              Renaming updates the category everywhere it&apos;s used. The slug
              is regenerated from the new name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm mode="edit" categoryId={category.id} defaultName={category.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}