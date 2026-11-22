import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: "demo-cloud",
    CLOUDINARY_API_KEY: "demo-key",
    CLOUDINARY_API_SECRET: "demo-secret",
  },
}));

import { uploadImage } from "./storage";

describe("Cloudinary image storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uploads images to Cloudinary and returns the secure URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          secure_url:
            "https://res.cloudinary.com/demo/image/upload/v1/avatars/test.png",
          public_id: "avatars/test",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await uploadImage(
      Buffer.from("valid-fake-png-bytes"),
      "image/png",
      "avatars",
    );

    expect(result.url).toContain("https://res.cloudinary.com/");
    expect(result.key).toBe("avatars/test");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudinary.com/v1_1/demo-cloud/image/upload",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
  });
});
