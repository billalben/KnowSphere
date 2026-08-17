import "server-only";

import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
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
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      courseChapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  return course;
}

export type tCourseDetail = Awaited<ReturnType<typeof getCourseBySlug>>;
