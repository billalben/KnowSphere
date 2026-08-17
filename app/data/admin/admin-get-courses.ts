import "server-only";

import prisma from "@/lib/prisma";
import { requireAdmin } from "./require-admin";

export async function adminGetCourses() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      smallDesc: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return courses;
}

export type tAdminCourse = Awaited<ReturnType<typeof adminGetCourses>>[number];
