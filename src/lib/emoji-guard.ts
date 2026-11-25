import fs from "node:fs";
import path from "node:path";

const EMOJI_PATTERN = /\p{Extended_Pictographic}/gu;
const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs"]);

/**
 * Returns every Unicode emoji match found in a text string.
 */
export function findEmojiViolations(text: string): string[] {
  const matches = text.match(EMOJI_PATTERN);
  return matches ? [...matches] : [];
}

/**
 * Recursively scans source directories for disallowed Unicode emojis.
 */
export function scanDirectoryForEmojis(dirs: string[]): string[] {
  const violations: string[] = [];

  function walk(currentPath: string) {
    if (!fs.existsSync(currentPath)) return;
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(currentPath)) {
        walk(path.join(currentPath, entry));
      }
      return;
    }
    if (!SCANNED_EXTENSIONS.has(path.extname(currentPath))) return;

    const lines = fs.readFileSync(currentPath, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      const found = findEmojiViolations(line);
      if (found.length > 0) {
        violations.push(`${currentPath}:${index + 1}:${found.join(",")}`);
      }
    });
  }

  for (const dir of dirs) {
    walk(dir);
  }
  return violations;
}
