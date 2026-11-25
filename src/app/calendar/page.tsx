import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey, getMonthRange, toJakartaDateKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarPlannerClient } from "@/components/student/CalendarPlannerClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

  const month = getJakartaTodayKey().slice(0, 7);
  const { start, end, startKey, endKey } = getMonthRange(month);

  const [user, settings, roadmaps, courses, tasks, monthActivities, allActivities] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: session.userId } }),
      prisma.appSettings.findUnique({ where: { id: "default" } }),
      prisma.roadmap.findMany({
        where: { status: "PUBLISHED", targetDate: { gte: start, lte: end } },
        select: { id: true, title: true, targetDate: true },
      }),
      prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          roadmap: { status: "PUBLISHED" },
          targetDate: { gte: start, lte: end },
        },
        select: { id: true, title: true, targetDate: true },
      }),
      prisma.workspaceTask.findMany({
        where: { userId: session.userId, dueDate: { gte: start, lte: end } },
        select: { id: true, title: true, dueDate: true, completed: true },
      }),
      prisma.dailyActivity.findMany({
        where: { userId: session.userId, dateKey: { gte: startKey, lte: endKey } },
      }),
      prisma.dailyActivity.findMany({ where: { userId: session.userId } }),
    ]);

  const events = [
    ...roadmaps
      .filter((r) => r.targetDate)
      .map((r) => ({
        id: `rm-${r.id}`,
        type: "ROADMAP_TARGET" as const,
        title: r.title,
        dateKey: toJakartaDateKey(r.targetDate!),
      })),
    ...courses
      .filter((c) => c.targetDate)
      .map((c) => ({
        id: `cs-${c.id}`,
        type: "COURSE_TARGET" as const,
        title: c.title,
        dateKey: toJakartaDateKey(c.targetDate!),
      })),
    ...tasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: `tk-${t.id}`,
        type: "TASK_DUE" as const,
        title: t.title,
        completed: t.completed,
        dateKey: toJakartaDateKey(t.dueDate!),
      })),
  ];

  const streak = calculateCurrentStreak(
    allActivities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  return (
    <AppShell
      role="STUDENT"
      activePath="/calendar"
      streakDays={streak.currentStreak}
      userName={user?.nickname || session.name}
      avatarUrl={user?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Belajar Yuk!"}
    >
      <CalendarPlannerClient
        initialMonth={month}
        initialEvents={events}
        initialStreakDays={monthActivities.map((a) => ({
          dateKey: a.dateKey,
          activityCount: a.activityCount,
        }))}
      />
    </AppShell>
  );
}
