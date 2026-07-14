import { env } from "@/lib/env";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@/lib/S3Client";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
      const body = await request.json();

      const { key } = body;
      if (!key) {
        return NextResponse.json({ error: "Key is required" }, { status: 400 });
      }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });

    await S3Client.send(command);

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}