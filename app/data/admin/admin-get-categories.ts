import "server-only";

import prisma from "@/lib/prisma";
import { requireAdmin } from "./require-admin";

export async function adminGetCategories() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { courses: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    courseCount: c._count.courses,
  }));
}

export type tAdminCategory = Awaited<ReturnType<typeof adminGetCategories>>[number];