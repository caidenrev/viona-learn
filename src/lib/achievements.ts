import { STICKERS } from "@/lib/stickers";

export interface AchievementStats {
  completedModules: number;
  currentStreak: number;
  passedCourses: number;
  bestQuizScore: number;
  submissionsCount: number;
  notesCount: number;
}

export interface AchievementBadge {
  id:
    | "first-step"
    | "streak-3"
    | "quiz-master"
    | "perfect-score"
    | "builder"
    | "note-keeper";
  title: string;
  description: string;
  sticker: string;
  tapeColor: "pink" | "lilac" | "yellow" | "mint" | "brown";
  unlocked: boolean;
  progressLabel: string;
}

/**
 * Computes realtime student achievement badges from database metrics.
 */
export function computeAchievements(
  stats: AchievementStats
): AchievementBadge[] {
  return [
    {
      id: "first-step",
      title: "Langkah Pertama",
      description: "Selesaikan modul belajarmu yang pertama",
      sticker: STICKERS.badges.firstStep,
      tapeColor: "yellow",
      unlocked: stats.completedModules >= 1,
      progressLabel: `${Math.min(stats.completedModules, 1)} / 1 modul`,
    },
    {
      id: "streak-3",
      title: "Api Konsisten",
      description: "Pertahankan streak belajar 3 hari berturut-turut",
      sticker: STICKERS.badges.streak,
      tapeColor: "pink",
      unlocked: stats.currentStreak >= 3,
      progressLabel: `${Math.min(stats.currentStreak, 3)} / 3 hari`,
    },
    {
      id: "quiz-master",
      title: "Jagoan Quiz",
      description: "Lulus minimal 1 Mini Quiz course",
      sticker: STICKERS.badges.quizMaster,
      tapeColor: "lilac",
      unlocked: stats.passedCourses >= 1,
      progressLabel: `${Math.min(stats.passedCourses, 1)} / 1 quiz`,
    },
    {
      id: "perfect-score",
      title: "Skor Bintang",
      description: "Raih nilai Mini Quiz minimal 90%",
      sticker: STICKERS.badges.perfectScore,
      tapeColor: "yellow",
      unlocked: stats.bestQuizScore >= 90,
      progressLabel:
        stats.bestQuizScore >= 90
          ? `Skor ${stats.bestQuizScore}%`
          : `Terbaik ${stats.bestQuizScore}% / 90%`,
    },
    {
      id: "builder",
      title: "Rajin Praktek",
      description: "Kirim minimal 1 tugas mini proyek praktek",
      sticker: STICKERS.badges.builder,
      tapeColor: "mint",
      unlocked: stats.submissionsCount >= 1,
      progressLabel: `${Math.min(stats.submissionsCount, 1)} / 1 proyek`,
    },
    {
      id: "note-keeper",
      title: "Kolektor Memo",
      description: "Simpan minimal 3 catatan atau memo belajar",
      sticker: STICKERS.badges.noteKeeper,
      tapeColor: "brown",
      unlocked: stats.notesCount >= 3,
      progressLabel: `${Math.min(stats.notesCount, 3)} / 3 catatan`,
    },
  ];
}
