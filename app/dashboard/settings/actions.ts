"use server";

import { revalidatePath } from "next/cache";

import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { type tApiResponse } from "@/types/api";
import { requireUser } from "@/app/data/user/require-user";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 20,
  }),
);

export async function updateCertificateVisibilityAction({
  showCertificatesPublicly,
}: {
  showCertificatesPublicly: boolean;
}): Promise<tApiResponse<null>> {
  const session = await requireUser();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return errorResponse("Too many requests. Please try again later.", null);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { showCertificatesPublicly },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/certificates");

    return successResponse(
      showCertificatesPublicly
        ? "Certificates are now public"
        : "Certificates are now private",
      null,
    );
  } catch {
    return errorResponse("Failed to update certificate visibility", null);
  }
}
