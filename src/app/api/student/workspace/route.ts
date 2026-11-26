import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { computeRoadmapCourseStates } from "@/lib/progression";
import { calculateCurrentStreak } from "@/lib/streak";

export async function GET() {
  try {
    const student = await requireRole("STUDENT");
    const todayKey = getJakartaTodayKey();

    const [
      user,
      settings,
      roadmaps,
      courseProgresses,
      moduleProgresses,
      tasks,
      notes,
      activities,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: student.userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          avatarUrl: true,
          dreamTarget: true,
        },
      }),
      prisma.appSettings.findUnique({ where: { id: "default" } }),
      prisma.roadmap.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ playlistId: null }, { playlist: { status: "PUBLISHED" } }],
        },
        orderBy: { orderIndex: "asc" },
        include: {
          playlist: {
            select: { id: true, title: true, slug: true, color: true },
          },
          courses: {
            where: { status: "PUBLISHED" },
            orderBy: { orderIndex: "asc" },
            include: {
              modules: {
                where: { status: "PUBLISHED" },
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.courseProgress.findMany({
        where: { userId: student.userId },
      }),
      prisma.moduleProgress.findMany({
        where: { userId: student.userId },
        select: { moduleId: true },
      }),
      prisma.workspaceTask.findMany({
        where: { userId: student.userId },
        orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
        take: 15,
      }),
      prisma.note.findMany({
        where: { userId: student.userId },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.dailyActivity.findMany({
        where: { userId: student.userId },
        orderBy: { dateKey: "desc" },
        take: 60,
      }),
    ]);

    const completedModuleIds = new Set(moduleProgresses.map((m) => m.moduleId));
    const progressMap = new Map(
      courseProgresses.map((p) => [
        p.courseId,
        { status: p.status, bestScore: p.bestScore },
      ])
    );

    const enrichedRoadmaps = roadmaps.map((rm) => {
      const states = computeRoadmapCourseStates(rm.courses, progressMap);
      const stateMap = new Map(states.map((s) => [s.courseId, s]));
      return {
        ...rm,
        courses: rm.courses.map((course) => {
          const state = stateMap.get(course.id);
          const totalModules = course.modules.length;
          const completedModules = course.modules.filter((m) =>
            completedModuleIds.has(m.id)
          ).length;
          return {
            id: course.id,
            title: course.title,
            slug: course.slug,
            summary: course.summary,
            thumbnailUrl: course.thumbnailUrl,
            targetDate: course.targetDate,
            orderIndex: course.orderIndex,
            effectiveStatus: state?.effectiveStatus ?? "LOCKED",
            bestScore: state?.bestScore ?? 0,
            totalModules,
            completedModules,
          };
        }),
      };
    });

    const streak = calculateCurrentStreak(
      activities.map((a) => a.dateKey),
      todayKey
    );

    return NextResponse.json({
      user,
      teacherWhatsapp: settings?.teacherWhatsapp ?? "",
      siteTitle: settings?.siteTitle ?? "Viona Learn",
      todayKey,
      streak,
      roadmaps: enrichedRoadmaps,
      tasks,
      notes,
      activeDates: activities.map((a) => a.dateKey),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
