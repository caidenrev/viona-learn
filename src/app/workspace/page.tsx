import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { computeRoadmapCourseStates } from "@/lib/progression";
import { calculateCurrentStreak } from "@/lib/streak";
import { computeAchievements } from "@/lib/achievements";
import { AppShell } from "@/components/layout/AppShell";
import { BentoWorkspaceClient } from "@/components/student/BentoWorkspaceClient";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

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
    submissionsCount,
    totalNotesCount,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.appSettings.findUnique({ where: { id: "default" } }),
    prisma.roadmap.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { orderIndex: "asc" },
      include: {
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
    prisma.courseProgress.findMany({ where: { userId: session.userId } }),
    prisma.moduleProgress.findMany({
      where: { userId: session.userId },
      select: { moduleId: true },
    }),
    prisma.workspaceTask.findMany({
      where: { userId: session.userId },
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
      take: 15,
    }),
    prisma.note.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.dailyActivity.findMany({
      where: { userId: session.userId },
      orderBy: { dateKey: "desc" },
      take: 60,
    }),
    prisma.courseSubmission.count({ where: { userId: session.userId } }),
    prisma.note.count({ where: { userId: session.userId } }),
  ]);

  const completedIds = new Set(moduleProgresses.map((m) => m.moduleId));
  const progressMap = new Map(
    courseProgresses.map((p) => [
      p.courseId,
      { status: p.status, bestScore: p.bestScore },
    ])
  );

  const serializedRoadmaps = roadmaps.map((rm) => {
    const states = computeRoadmapCourseStates(rm.courses, progressMap);
    const stateMap = new Map(states.map((s) => [s.courseId, s]));
    return {
      id: rm.id,
      title: rm.title,
      slug: rm.slug,
      description: rm.description,
      levelLabel: rm.levelLabel,
      courses: rm.courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        thumbnailUrl: c.thumbnailUrl,
        targetDate: c.targetDate ? c.targetDate.toISOString() : null,
        orderIndex: c.orderIndex,
        effectiveStatus: stateMap.get(c.id)?.effectiveStatus ?? "LOCKED",
        bestScore: stateMap.get(c.id)?.bestScore ?? 0,
        totalModules: c.modules.length,
        completedModules: c.modules.filter((m) => completedIds.has(m.id)).length,
      })),
    };
  });

  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    todayKey
  );

  const achievements = computeAchievements({
    completedModules: moduleProgresses.length,
    currentStreak: streak.currentStreak,
    passedCourses: courseProgresses.filter((p) => p.status === "PASSED").length,
    bestQuizScore:
      courseProgresses.length > 0
        ? Math.max(...courseProgresses.map((p) => p.bestScore))
        : 0,
    submissionsCount,
    notesCount: totalNotesCount,
  });

  return (
    <AppShell
      role="STUDENT"
      activePath="/workspace"
      streakDays={streak.currentStreak}
      userName={user?.nickname || user?.name || session.name}
      avatarUrl={user?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Belajar Yuk!"}
    >
      <BentoWorkspaceClient
        userName={user?.nickname || user?.name || session.name}
        teacherWhatsapp={settings?.teacherWhatsapp ?? ""}
        todayKey={todayKey}
        initialStreak={streak}
        achievements={achievements}
        roadmaps={serializedRoadmaps}
        initialTasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          category: t.category,
          isTodayGoal: t.isTodayGoal,
        }))}
        initialNotes={notes.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          color: n.color,
        }))}
        activeDates={activities.map((a) => a.dateKey)}
      />
    </AppShell>
  );
}
