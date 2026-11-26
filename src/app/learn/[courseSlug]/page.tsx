import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { getCachedAppSettings } from "@/lib/cached-settings";
import { calculateCurrentStreak } from "@/lib/streak";
import { getPublishedRoadmapCourseStates } from "@/lib/student-course-access";
import { AppShell } from "@/components/layout/AppShell";
import { CourseReaderClient } from "@/components/student/CourseReaderClient";

export const dynamic = "force-dynamic";

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

  const { courseSlug } = await params;

  const [user, settings, course, activities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { nickname: true, avatarUrl: true },
    }),
    getCachedAppSettings(),
    prisma.course.findFirst({
      where: {
        slug: courseSlug,
        status: "PUBLISHED",
        roadmap: { status: "PUBLISHED" },
      },
      include: {
        roadmap: { select: { id: true, title: true, slug: true } },
        modules: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
        },
        _count: { select: { quizQuestions: true } },
      },
    }),
    prisma.dailyActivity.findMany({
      where: { userId: session.userId },
      orderBy: { dateKey: "desc" },
      take: 90,
      select: { dateKey: true },
    }),
  ]);

  if (!course) notFound();

  const states = await getPublishedRoadmapCourseStates(
    session.userId,
    course.roadmapId
  );
  const state = states.get(course.id);
  if (!state || state.effectiveStatus === "LOCKED") {
    redirect(`/roadmaps/${course.roadmap.slug}`);
  }

  const [moduleProgresses, rating, submission] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: {
        userId: session.userId,
        moduleId: { in: course.modules.map((m) => m.id) },
      },
      select: { moduleId: true },
    }),
    prisma.courseRating.findUnique({
      where: {
        userId_courseId: { userId: session.userId, courseId: course.id },
      },
    }),
    prisma.courseSubmission.findUnique({
      where: {
        userId_courseId: { userId: session.userId, courseId: course.id },
      },
    }),
  ]);

  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  return (
    <AppShell
      role="STUDENT"
      activePath="/workspace"
      streakDays={streak.currentStreak}
      userName={user?.nickname || session.name}
      avatarUrl={user?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Viona Learn"}
    >
      <CourseReaderClient
        course={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          summary: course.summary,
          passingScore: course.passingScore,
          hasPracticeTask: course.hasPracticeTask,
          practicePrompt: course.practicePrompt,
          effectiveStatus: state.effectiveStatus,
          bestScore: state.bestScore,
          roadmap: { title: course.roadmap.title, slug: course.roadmap.slug },
        }}
        modules={course.modules.map((m) => ({
          id: m.id,
          chapterTitle: m.chapterTitle,
          title: m.title,
          orderIndex: m.orderIndex,
          contentJson: m.contentJson,
          videoUrl: m.videoUrl,
          estimatedMinutes: m.estimatedMinutes,
        }))}
        initialCompletedIds={moduleProgresses.map((m) => m.moduleId)}
        initialRating={
          rating ? { stars: rating.stars, review: rating.review } : null
        }
        initialSubmission={
          submission
            ? {
                repoUrl: submission.repoUrl,
                demoUrl: submission.demoUrl,
                studentNote: submission.studentNote,
                status: submission.status,
                score: submission.score,
                mentorFeedback: submission.mentorFeedback,
              }
            : null
        }
        teacherWhatsapp={settings?.teacherWhatsapp ?? ""}
        hasQuiz={course._count.quizQuestions > 0}
      />
    </AppShell>
  );
}
