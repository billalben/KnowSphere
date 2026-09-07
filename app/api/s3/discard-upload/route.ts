import { NextResponse } from "next/server";
import z from "zod";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { discardUploads } from "@/lib/s3/discard-upload";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const discardSchema = z.object({
  keys: z.array(z.string().min(1)).max(50),
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
      max: 30,
    }),
  );

export async function POST(req: Request) {
  const session = await requireAdmin();

  try {
    const decision = await aj.protect(await request(), {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const parsed = discardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const results = await discardUploads(parsed.data.keys, session.user.id);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("discard-upload error", error);
    return NextResponse.json(
      { error: "Failed to discard uploads" },
      { status: 500 },
    );
  }
}
