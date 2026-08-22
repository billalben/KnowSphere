import "server-only";

import prisma from "@/lib/prisma";

import { requireUser } from "./require-user";

export async function getMyCertificateVisibility(): Promise<boolean> {
  const session = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { showCertificatesPublicly: true },
  });

  return user?.showCertificatesPublicly ?? true;
}
