import "server-only";

import prisma from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/s3/get-download-url";

import { requireUser } from "./require-user";

export type tMyCertificate = {
  id: string;
  verificationCode: string;
  issuedAt: Date;

  course: {
    id: string;
    slug: string;
    title: string;
    smallDesc: string;
    imageUrl: string | null;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    duration: number;
  } | null;

  // Snapshot fields — kept for display if the live course goes away.
  courseTitleSnapshot: string;
  courseSlugSnapshot: string;
  levelSnapshot: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationSnapshot: number;
  lessonsCountSnapshot: number;

  isPubliclyVisible: boolean;
};

export async function getMyCertificates(): Promise<tMyCertificate[]> {
  const session = await requireUser();

  const rows = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      verificationCode: true,
      issuedAt: true,
      courseTitleSnapshot: true,
      courseSlugSnapshot: true,
      levelSnapshot: true,
      durationSnapshot: true,
      lessonsCountSnapshot: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          smallDesc: true,
          fileKey: true,
          level: true,
          duration: true,
        },
      },
      user: { select: { showCertificatesPublicly: true } },
    },
  });

  const coursesWithUrls = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      imageUrl: row.course
        ? await getDownloadUrl(row.course.fileKey)
        : null,
    })),
  );

  return coursesWithUrls.map((row) => ({
    id: row.id,
    verificationCode: row.verificationCode,
    issuedAt: row.issuedAt,
    course: row.course && {
      id: row.course.id,
      slug: row.course.slug,
      title: row.course.title,
      smallDesc: row.course.smallDesc,
      imageUrl: row.imageUrl,
      level: row.course.level,
      duration: row.course.duration,
    },
    courseTitleSnapshot: row.courseTitleSnapshot,
    courseSlugSnapshot: row.courseSlugSnapshot,
    levelSnapshot: row.levelSnapshot,
    durationSnapshot: row.durationSnapshot,
    lessonsCountSnapshot: row.lessonsCountSnapshot,
    isPubliclyVisible: row.user.showCertificatesPublicly,
  }));
}
