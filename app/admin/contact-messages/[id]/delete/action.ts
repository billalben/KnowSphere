"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    }),
  );

export async function deleteContactMessage({
  messageId,
}: {
  messageId: string;
}) {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests", null);
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      select: { id: true },
    });

    if (!message) {
      return errorResponse("Message not found", null);
    }

    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    revalidatePath("/admin/contact-messages");

    return successResponse("Message deleted successfully", null);
  } catch {
    return errorResponse("Failed to delete message", null);
  }
}
