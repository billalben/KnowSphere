import { NextResponse } from "next/server";
import z from "zod";

import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { discardUpload } from "@/lib/s3/discard-upload";

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

const deleteSchema = z.object({
  key: z.string().min(1),
});

export async function DELETE(request: Request) {
  const session = await requireAdmin();

  try {
    const decision = await aj.protect(request, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const result = await discardUpload(parsed.data.key, session.user.id);

    if (result === "not-owned") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "File deleted successfully", result },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
