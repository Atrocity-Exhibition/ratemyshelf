import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function isR2Configured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME,
  );
}

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  folder: "covers" | "avatars" = "covers",
): Promise<{ url: string; key: string }> {
  const extension = ALLOWED_MIME_TYPES.get(mimeType.toLowerCase());
  if (!extension) {
    throw new Error(
      `Invalid image type: ${mimeType}. Allowed: JPEG, PNG, WebP, GIF.`,
    );
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds maximum allowed size of 5MB.");
  }

  const randomId = randomBytes(16).toString("hex");
  const key = `${folder}/${Date.now()}-${randomId}.${extension}`;

  if (isR2Configured()) {
    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    const baseUrl =
      env.R2_PUBLIC_URL ??
      env.NEXT_PUBLIC_R2_PUBLIC_URL ??
      `https://${env.R2_BUCKET_NAME}.r2.dev`;

    const cleanBase = baseUrl.replace(/\/$/, "");
    return {
      url: `${cleanBase}/${key}`,
      key,
    };
  }

  // Fallback to local storage for development/testing
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, `${Date.now()}-${randomId}.${extension}`);
  await fs.writeFile(filePath, buffer);

  const localKey = `${folder}/${path.basename(filePath)}`;
  return {
    url: `/uploads/${localKey}`,
    key: localKey,
  };
}
