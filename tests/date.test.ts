import { describe, it, expect } from "vitest";
import {
  toJakartaDateKey,
  getJakartaTodayKey,
  shiftDateKey,
  getMonthRange,
} from "@/lib/date";

describe("Jakarta timezone date helpers", () => {
  it("handles UTC+7 midnight rollover accurately", () => {
    expect(toJakartaDateKey(new Date("2026-11-25T16:55:00.000Z"))).toBe("2026-11-25");
    expect(toJakartaDateKey(new Date("2026-11-25T17:05:00.000Z"))).toBe("2026-11-26");
  });

  it("shifts dateKeys across month and leap-year boundaries", () => {
    expect(shiftDateKey("2026-11-01", -1)).toBe("2026-10-31");
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDateKey("2024-03-01", -1)).toBe("2024-02-29");
  });

  it("computes Jakarta month bounds cleanly", () => {
    const range = getMonthRange("2026-11");
    expect(range.startKey).toBe("2026-11-01");
    expect(range.endKey).toBe("2026-11-30");
    expect(toJakartaDateKey(range.start)).toBe("2026-11-01");
    expect(toJakartaDateKey(range.end)).toBe("2026-11-30");
    expect(getJakartaTodayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
