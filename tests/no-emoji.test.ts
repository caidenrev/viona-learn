import { describe, it, expect } from "vitest";
import path from "node:path";
import { findEmojiViolations, scanDirectoryForEmojis } from "@/lib/emoji-guard";

describe("zero-emoji boundary", () => {
  it("flags unicode emojis when present", () => {
    expect(findEmojiViolations("hello \u{1F525}")).toHaveLength(1);
    expect(findEmojiViolations("MODUL AKTIF \u2B50")).toHaveLength(1);
    expect(findEmojiViolations("BELAJAR YUK! 100%")).toHaveLength(0);
  });

  it("scans src and prisma directories with zero emoji violations", () => {
    const root = path.resolve(__dirname, "..");
    const violations = scanDirectoryForEmojis([
      path.join(root, "src"),
      path.join(root, "prisma"),
    ]);
    expect(violations).toEqual([]);
  });
});
