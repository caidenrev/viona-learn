import { describe, expect, it } from "vitest";
import { computeAchievements } from "@/lib/achievements";

describe("computeAchievements", () => {
  it("keeps all 6 badges locked when metrics are zero", () => {
    const badges = computeAchievements({
      completedModules: 0,
      currentStreak: 0,
      passedCourses: 0,
      bestQuizScore: 0,
      submissionsCount: 0,
      notesCount: 0,
    });

    expect(badges).toHaveLength(6);
    expect(badges.every((b) => !b.unlocked)).toBe(true);
  });

  it("unlocks matching badges from realtime student progress", () => {
    const badges = computeAchievements({
      completedModules: 2,
      currentStreak: 3,
      passedCourses: 1,
      bestQuizScore: 95,
      submissionsCount: 1,
      notesCount: 4,
    });

    expect(badges.every((b) => b.unlocked)).toBe(true);
    expect(badges.find((b) => b.id === "perfect-score")?.progressLabel).toBe(
      "Skor 95%"
    );
  });
});
