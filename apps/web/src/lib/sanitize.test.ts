import { describe, expect, it } from "vitest";
import { sanitizeReviewBody } from "./sanitize";

describe("sanitizeReviewBody", () => {
  it("removes script tags", () => {
    const output = sanitizeReviewBody("<p>Hello</p><script>alert(1)</script>");
    expect(output).not.toContain("<script");
    expect(output).toContain("<p>Hello</p>");
  });

  it("removes event handlers", () => {
    const output = sanitizeReviewBody('<p onclick="alert(1)">Hi</p>');
    expect(output).not.toContain("onclick");
  });

  it("removes javascript: links", () => {
    const output = sanitizeReviewBody('<a href="javascript:alert(1)">x</a>');
    expect(output).not.toContain("javascript:");
  });

  it("keeps allowed formatting", () => {
    const output = sanitizeReviewBody("<p><strong>Good</strong> <em>read</em></p>");
    expect(output).toContain("<strong>Good</strong>");
    expect(output).toContain("<em>read</em>");
  });
});
