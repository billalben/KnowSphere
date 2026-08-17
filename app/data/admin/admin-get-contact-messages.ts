import "server-only";

import prisma from "@/lib/prisma";

import { requireAdmin } from "./require-admin";

export async function adminGetContactMessages() {
  await requireAdmin();

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      message: true,
      userId: true,
      createdAt: true,
    },
  });

  return messages;
}

export type tContactMessage = Awaited<
  ReturnType<typeof adminGetContactMessages>
>[number];

export async function adminGetContactMessage(id: string) {
  await requireAdmin();

  const message = await prisma.contactMessage.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      message: true,
      userId: true,
      createdAt: true,
    },
  });

  return message;
}
