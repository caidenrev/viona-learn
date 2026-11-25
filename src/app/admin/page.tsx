import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { AdminKonsolClient } from "@/components/admin/AdminKonsolClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "TEACHER") redirect("/workspace");

  const [teacher, student, settings, courses, submissions, ratings, attempts, mentorNotes] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: session.userId } }),
      prisma.user.findUnique({ where: { role: "STUDENT" } }),
      prisma.appSettings.findUnique({ where: { id: "default" } }),
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        include: {
          courseProgresses: true,
        },
      }),
      prisma.courseSubmission.findMany({
        orderBy: { updatedAt: "desc" },
        include: { course: { select: { title: true } } },
      }),
      prisma.courseRating.findMany({
        orderBy: { updatedAt: "desc" },
        include: { course: { select: { title: true } } },
      }),
      prisma.quizAttempt.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { course: { select: { title: true } } },
      }),
      prisma.mentorPrivateNote.findMany({
        where: { authorId: session.userId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const activities = student
    ? await prisma.dailyActivity.findMany({
        where: { userId: student.id },
        orderBy: { dateKey: "desc" },
        take: 60,
      })
    : [];

  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  const passedCourseCount = courses.filter((c) =>
    c.courseProgresses.some((p) => p.status === "PASSED")
  ).length;

  return (
    <AppShell
      role="TEACHER"
      activePath="/admin"
      streakDays={streak.currentStreak}
      userName={teacher?.name || session.name}
      avatarUrl={teacher?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Belajar Yuk!"}
    >
      <AdminKonsolClient
        studentName={student?.nickname || student?.name || "Siswa"}
        streakDays={streak.currentStreak}
        passedCourseCount={passedCourseCount}
        totalCourseCount={courses.length}
        initialSubmissions={submissions.map((s) => ({
          id: s.id,
          courseTitle: s.course.title,
          repoUrl: s.repoUrl,
          demoUrl: s.demoUrl,
          studentNote: s.studentNote,
          status: s.status,
          score: s.score,
          mentorFeedback: s.mentorFeedback,
        }))}
        ratings={ratings.map((r) => ({
          id: r.id,
          courseTitle: r.course.title,
          stars: r.stars,
          review: r.review,
        }))}
        quizAttempts={attempts.map((a) => ({
          id: a.id,
          courseTitle: a.course.title,
          score: a.score,
          passed: a.passed,
        }))}
        initialMentorNotes={mentorNotes.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
        }))}
      />
    </AppShell>
  );
}
