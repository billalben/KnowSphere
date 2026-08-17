import "server-only";

import prisma from "@/lib/prisma";
import { requireAdmin } from "./require-admin";
import { notFound } from "next/navigation";

type TAdminGetLessonProps = {
  id: string;
};

export async function adminGetLesson({ id }: TAdminGetLessonProps) {
  await requireAdmin();

  const data = await prisma.lesson.findUnique({
    where: { id },
    select: {
      title: true,
      videoKey: true,
      thumbnailKey: true,
      description: true,
      id: true,
      position: true,
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export type TAdminGetLesson = Awaited<ReturnType<typeof adminGetLesson>>;
