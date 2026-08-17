"use server";

import { z } from "zod";

import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";

import { getOptionalSession } from "../_lib/get-optional-session";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be at most 1000 characters"),
});

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
      max: 1,
    }),
  );

export async function submitContactMessage(values: unknown) {
  try {
    const req = await request();
    const session = await getOptionalSession();
    const fingerprint = session?.user?.id ?? "anonymous";

    const decision = await aj.protect(req, { fingerprint });
    if (decision.isDenied()) {
      return errorResponse("Too many requests. Please try again later.", null);
    }

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      return errorResponse("Invalid data", z.treeifyError(parsed.error));
    }

    await prisma.contactMessage.create({
      data: {
        ...parsed.data,
        userId: session?.user?.id ?? null,
      },
    });

    return successResponse("Message sent — we'll get back to you soon.", null);
  } catch {
    return errorResponse("Failed to send message", null);
  }
}
