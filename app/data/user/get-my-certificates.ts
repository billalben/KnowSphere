import "server-only";

import prisma from "@/lib/prisma";

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
    fileKey: string | null;
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

  return rows.map((row) => ({
    id: row.id,
    verificationCode: row.verificationCode,
    issuedAt: row.issuedAt,
    course: row.course,
    courseTitleSnapshot: row.courseTitleSnapshot,
    courseSlugSnapshot: row.courseSlugSnapshot,
    levelSnapshot: row.levelSnapshot,
    durationSnapshot: row.durationSnapshot,
    lessonsCountSnapshot: row.lessonsCountSnapshot,
    isPubliclyVisible: row.user.showCertificatesPublicly,
  }));
}
