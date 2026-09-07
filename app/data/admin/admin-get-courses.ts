import "server-only";

import prisma from "@/lib/prisma";
import { getDownloadUrls } from "@/lib/s3/get-download-url";
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
      categories: {
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const imageUrls = await getDownloadUrls(courses.map((c) => c.fileKey));

  return courses.map((course, i) => ({
    ...course,
    imageUrl: imageUrls[i],
  }));
}

export type tAdminCourse = Awaited<ReturnType<typeof adminGetCourses>>[number];
