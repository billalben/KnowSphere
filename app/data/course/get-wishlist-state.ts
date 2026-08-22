import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function getWishlistedCourseIds(): Promise<Set<string>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Set();
  }

  const rows = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { courseId: true },
  });

  return new Set(rows.map((r) => r.courseId));
}

export async function isCourseWishlisted({
  courseId,
  userId,
}: {
  courseId: string;
  userId: string;
}): Promise<boolean> {
  const row = await prisma.wishlistItem.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  return Boolean(row);
}
