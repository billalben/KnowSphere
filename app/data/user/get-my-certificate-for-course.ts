import "server-only";

import prisma from "@/lib/prisma";

import { requireUser } from "./require-user";

export type tMyCertificateForCourse = {
  id: string;
  verificationCode: string;
  issuedAt: Date;
} | null;

export async function getMyCertificateForCourse({
  courseId,
}: {
  courseId: string;
}): Promise<tMyCertificateForCourse> {
  const session = await requireUser();

  const certificate = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
    select: {
      id: true,
      verificationCode: true,
      issuedAt: true,
    },
  });

  return certificate;
}
