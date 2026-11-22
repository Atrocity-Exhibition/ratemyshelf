import { createHash, randomBytes } from "crypto";
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

function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );
}

async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  key: string,
): Promise<{ url: string; key: string }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder: key.split("/")[0],
    public_id: key.split("/")[1],
    timestamp: String(timestamp),
  };
  const signatureParams = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}=${value}`)
    .join("&");
  const signature = createHash("sha1")
    .update(`${signatureParams}${env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  const form = new FormData();
  const fileBytes = new Uint8Array(buffer.byteLength);
  fileBytes.set(buffer);
  form.append("file", new Blob([fileBytes.buffer], { type: mimeType }), key);
  form.append("api_key", env.CLOUDINARY_API_KEY!);
  form.append("timestamp", String(timestamp));
  form.append("folder", params.folder);
  form.append("public_id", params.public_id);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );
  const payload = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new Error(
      payload.error?.message ?? "Cloudinary image upload failed.",
    );
  }

  return { url: payload.secure_url, key: payload.public_id };
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
  const fileName = `${Date.now()}-${randomId}`;
  const key = `${folder}/${fileName}`;

  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer, mimeType, key);
  }

  if (isR2Configured()) {
    const client = getR2Client();
    const storageKey = `${key}.${extension}`;
    await client.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: storageKey,
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
      url: `${cleanBase}/${storageKey}`,
      key: storageKey,
    };
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Image uploads are not configured for production. Configure Cloudinary or Cloudflare R2.",
    );
  }

  // Fallback to local storage for development/testing
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, `${fileName}.${extension}`);
  await fs.writeFile(filePath, buffer);

  const localKey = `${folder}/${path.basename(filePath)}`;
  return {
    url: `/uploads/${localKey}`,
    key: localKey,
  };
}
