import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { CourseEditorClient } from "@/components/admin/CourseEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "TEACHER") redirect("/workspace");

  const { id } = await params;

  const [teacher, student, settings, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.user.findUnique({ where: { role: "STUDENT" } }),
    prisma.appSettings.findUnique({ where: { id: "default" } }),
    prisma.course.findUnique({
      where: { id },
      include: {
        roadmap: { select: { title: true } },
        modules: { orderBy: { orderIndex: "asc" } },
        quizQuestions: { orderBy: { orderIndex: "asc" } },
      },
    }),
  ]);

  if (!course) notFound();

  const activities = student
    ? await prisma.dailyActivity.findMany({ where: { userId: student.id } })
    : [];
  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  return (
    <AppShell
      role="TEACHER"
      activePath="/admin/roadmaps"
      streakDays={streak.currentStreak}
      userName={teacher?.name || session.name}
      avatarUrl={teacher?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Belajar Yuk!"}
    >
      <CourseEditorClient
        course={{
          id: course.id,
          title: course.title,
          summary: course.summary,
          thumbnailUrl: course.thumbnailUrl,
          targetDate: course.targetDate ? course.targetDate.toISOString() : null,
          status: course.status,
          passingScore: course.passingScore,
          hasPracticeTask: course.hasPracticeTask,
          practicePrompt: course.practicePrompt,
          roadmapTitle: course.roadmap.title,
        }}
        initialModules={course.modules.map((m) => ({
          id: m.id,
          chapterTitle: m.chapterTitle,
          title: m.title,
          orderIndex: m.orderIndex,
          contentJson: m.contentJson as Record<string, unknown>,
          videoUrl: m.videoUrl,
          estimatedMinutes: m.estimatedMinutes,
          status: m.status,
        }))}
        initialQuiz={course.quizQuestions.map((q) => ({
          prompt: q.prompt,
          options: q.options as Array<{ id: string; text: string }>,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation ?? "",
        }))}
      />
    </AppShell>
  );
}
