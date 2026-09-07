import "server-only";

import prisma from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/s3/get-download-url";
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
      description: true,
      id: true,
      position: true,
    },
  });

  if (!data) {
    return notFound();
  }

  const videoUrl = await getDownloadUrl(data.videoKey);

  return { ...data, videoUrl };
}

export type TAdminGetLesson = Awaited<ReturnType<typeof adminGetLesson>>;
