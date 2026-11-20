import { describe, expect, it } from "vitest";
import { passwordResetUrl } from "./passwordReset";
import { verificationUrl } from "./verification";

describe("auth tokens and URLs", () => {
  it("formats password reset URL correctly", () => {
    const url = passwordResetUrl("sample-token-abc-123");
    expect(url).toContain("/reset-password?token=sample-token-abc-123");
  });

  it("formats email verification URL correctly", () => {
    const url = verificationUrl("sample-verify-token");
    expect(url).toContain("/verify-email?token=sample-verify-token");
  });
});
