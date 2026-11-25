import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { NotesTasksClient } from "@/components/student/NotesTasksClient";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

  const [user, settings, tasks, notes, submissions, activities] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: session.userId } }),
      prisma.appSettings.findUnique({ where: { id: "default" } }),
      prisma.workspaceTask.findMany({
        where: { userId: session.userId },
        orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
      }),
      prisma.note.findMany({
        where: { userId: session.userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.courseSubmission.findMany({
        where: { userId: session.userId },
        include: { course: { select: { title: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.dailyActivity.findMany({ where: { userId: session.userId } }),
    ]);

  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  return (
    <AppShell
      role="STUDENT"
      activePath="/notes"
      streakDays={streak.currentStreak}
      userName={user?.nickname || session.name}
      avatarUrl={user?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Viona Learn"}
    >
      <NotesTasksClient
        initialTasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          category: t.category,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        }))}
        initialNotes={notes.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          tags: n.tags,
          color: n.color,
        }))}
        submissions={submissions.map((s) => ({
          id: s.id,
          courseTitle: s.course.title,
          status: s.status,
          score: s.score,
          repoUrl: s.repoUrl,
          demoUrl: s.demoUrl,
          mentorFeedback: s.mentorFeedback,
        }))}
      />
    </AppShell>
  );
}
