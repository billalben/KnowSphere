import "server-only";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function checkIfCourseBought({ courseId }: { courseId: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) return false;

  const enrolllment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      },
    },
    select: {
      status: true,
    },
  });

  return enrolllment?.status === "Active" ? true : false;
}
