import { describe, expect, it } from "vitest";
import { uploadImage } from "./storage";

describe("uploadImage validation", () => {
  it("rejects invalid MIME types", async () => {
    const fakeBuffer = Buffer.from("hello world");
    await expect(
      uploadImage(fakeBuffer, "text/plain", "covers"),
    ).rejects.toThrow("Invalid image type");
  });

  it("rejects executable or script MIME types", async () => {
    const fakeBuffer = Buffer.from("<script>alert(1)</script>");
    await expect(
      uploadImage(fakeBuffer, "application/javascript", "avatars"),
    ).rejects.toThrow("Invalid image type");
  });

  it("rejects oversized images (> 5MB)", async () => {
    const hugeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);
    await expect(
      uploadImage(hugeBuffer, "image/png", "covers"),
    ).rejects.toThrow("File exceeds maximum allowed size");
  });

  it("successfully processes valid image buffer", async () => {
    const validBuffer = Buffer.from("valid-fake-png-bytes");
    const result = await uploadImage(validBuffer, "image/png", "covers");
    expect(result.url).toBeDefined();
    expect(result.key).toMatch(/^covers\/\d+-[a-f0-9]+\.png$/);
  });
});
