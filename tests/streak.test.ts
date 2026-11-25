import { describe, it, expect } from "vitest";
import { calculateCurrentStreak } from "@/lib/streak";

describe("daily streak calculation", () => {
  it("counts consecutive days ending today or yesterday", () => {
    expect(
      calculateCurrentStreak(
        ["2026-11-23", "2026-11-24", "2026-11-25"],
        "2026-11-25"
      )
    ).toEqual({ currentStreak: 3, activeToday: true });

    // Grace until midnight if yesterday was active
    expect(
      calculateCurrentStreak(["2026-11-23", "2026-11-24"], "2026-11-25")
    ).toEqual({ currentStreak: 2, activeToday: false });
  });

  it("resets streak when there is a gap before yesterday", () => {
    expect(
      calculateCurrentStreak(["2026-11-20", "2026-11-23"], "2026-11-25")
    ).toEqual({ currentStreak: 0, activeToday: false });
  });
});
