import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { getJakartaTodayKey, shiftDateKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";

export async function GET() {
  try {
    const student = await requireRole("STUDENT");
    const todayKey = getJakartaTodayKey();
    const start28Key = shiftDateKey(todayKey, -27);

    const [activities, attempts, ratings, moduleCount, completedCount, courses] =
      await Promise.all([
        prisma.dailyActivity.findMany({
          where: { userId: student.userId },
          orderBy: { dateKey: "desc" },
          take: 60,
        }),
        prisma.quizAttempt.findMany({
          where: { userId: student.userId },
          orderBy: { createdAt: "desc" },
          include: { course: { select: { title: true, slug: true } } },
        }),
        prisma.courseRating.findMany({
          where: { userId: student.userId },
          include: { course: { select: { title: true, slug: true } } },
        }),
        prisma.module.count({
          where: {
            status: "PUBLISHED",
            course: { status: "PUBLISHED", roadmap: { status: "PUBLISHED" } },
          },
        }),
        prisma.moduleProgress.count({ where: { userId: student.userId } }),
        prisma.course.findMany({
          where: { status: "PUBLISHED", roadmap: { status: "PUBLISHED" } },
          orderBy: { orderIndex: "asc" },
          include: {
            courseProgresses: { where: { userId: student.userId } },
          },
        }),
      ]);

    const streak = calculateCurrentStreak(
      activities.map((a) => a.dateKey),
      todayKey
    );

    const activityMap = new Map(activities.map((a) => [a.dateKey, a]));
    const last28Days = Array.from({ length: 28 }, (_, idx) => {
      const key = shiftDateKey(start28Key, idx);
      const item = activityMap.get(key);
      return {
        dateKey: key,
        activityCount: item?.activityCount ?? 0,
        studyMinutes: item?.studyMinutes ?? 0,
      };
    });

    const totalStudyMinutes = activities.reduce(
      (sum, a) => sum + a.studyMinutes,
      0
    );
    const averageQuizScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
          )
        : 0;

    return NextResponse.json({
      streak,
      totalStudyMinutes,
      averageQuizScore,
      moduleCompletion: { completed: completedCount, total: moduleCount },
      last28Days,
      attempts,
      ratings,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        status: c.courseProgresses[0]?.status ?? "LOCKED",
        bestScore: c.courseProgresses[0]?.bestScore ?? 0,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
