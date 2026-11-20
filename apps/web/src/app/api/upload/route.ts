import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as "covers" | "avatars") || "covers";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "A valid file is required" },
        { status: 400 },
      );
    }

    if (folder !== "covers" && folder !== "avatars") {
      return NextResponse.json(
        { error: "Invalid target folder" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImage(buffer, file.type, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
