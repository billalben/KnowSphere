"use server";

import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { sweepOrphanUploads } from "@/lib/s3/discard-upload";

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

export async function cleanupOrphanUploadsAction(opts?: {
  olderThanHours?: number;
}) {
  const session = await requireAdmin();

  try {
    const decision = await aj.protect(await request(), {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error" as const,
        message: "Too many requests",
        data: null,
      };
    }

    const result = await sweepOrphanUploads(opts?.olderThanHours ?? 24);

    return {
      status: "success" as const,
      message: `Scanned ${result.scanned} orphan upload${result.scanned === 1 ? "" : "s"}; removed ${result.deleted}${result.errors ? ` (${result.errors} error${result.errors === 1 ? "" : "s"})` : ""}.`,
      data: result,
    };
  } catch (error) {
    console.error("cleanupOrphanUploadsAction error", error);
    return {
      status: "error" as const,
      message: "Failed to clean up orphan uploads",
      data: null,
    };
  }
}
