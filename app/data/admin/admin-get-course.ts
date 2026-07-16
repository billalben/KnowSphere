import "server-only";

import prisma from "@/lib/prisma";
import { requireAdmin } from "./require-admin";
import { notFound } from "next/navigation";

export async function adminGetCourse(courseId: string) {
  await requireAdmin();

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      smallDesc: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
      category: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!course) {
    notFound();
  }

  return course;
}

export type tAdminGetCourse = Awaited<ReturnType<typeof adminGetCourse>>;
