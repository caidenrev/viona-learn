import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { STICKERS } from "@/lib/stickers";

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe("stickers usage and asset integrity", () => {
  it("verifies every file in public/stickers exists in STICKERS and every sheet/hero key is used in src/", () => {
    const stickersDir = path.join(process.cwd(), "public", "stickers");
    const diskFiles = fs
      .readdirSync(stickersDir)
      .filter((f) => f.endsWith(".png"))
      .map((f) => `/stickers/${f}`);

    const mappedPaths = new Set<string>([
      STICKERS.mascotHirono,
      STICKERS.welcomeBunny,
      STICKERS.pomodoroCat,
      STICKERS.streakStar,
      STICKERS.quizBubbleCat,
      STICKERS.passedTrophyBunny,
      STICKERS.tanyaHusbandBubble,
      STICKERS.notesBearMemo,
      STICKERS.playgroundBearLaptop,
      STICKERS.mentorBearDesk,
      ...Object.values(STICKERS.badges),
      ...Object.values(STICKERS.sheet),
    ]);

    for (const file of diskFiles) {
      expect(mappedPaths.has(file)).toBe(true);
    }

    const srcContents = collectFiles(path.join(process.cwd(), "src"))
      .filter((f) => !f.endsWith("stickers.ts"))
      .map((f) => fs.readFileSync(f, "utf8"))
      .join("\n");

    const topKeys = [
      "mascotHirono",
      "welcomeBunny",
      "pomodoroCat",
      "streakStar",
      "quizBubbleCat",
      "passedTrophyBunny",
      "tanyaHusbandBubble",
      "notesBearMemo",
      "playgroundBearLaptop",
      "mentorBearDesk",
    ];
    for (const k of topKeys) {
      expect(srcContents).toContain(`STICKERS.${k}`);
    }

    for (const k of Object.keys(STICKERS.sheet)) {
      expect(srcContents).toContain(`STICKERS.sheet.${k}`);
    }
  });
});
