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
      createdAt: true,
      updatedAt: true,
      categories: {
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      },
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
      courseReviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          isEdited: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, image: true, role: true },
          },
        },
      },
    },
  });

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  const reviews = course.courseReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    isEdited: r.isEdited,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    author: {
      id: r.user.id,
      name: r.user.name,
      image: r.user.image,
      role: r.user.role,
    },
  }));

  return { ...course, courseReviews: reviews };
}

export type tCourseDetail = Awaited<ReturnType<typeof getCourseBySlug>>;
