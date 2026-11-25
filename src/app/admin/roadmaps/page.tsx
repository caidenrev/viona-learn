import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { RoadmapManagerClient } from "@/components/admin/RoadmapManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminRoadmapsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "TEACHER") redirect("/workspace");

  const [teacher, student, settings, roadmaps] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.user.findUnique({ where: { role: "STUDENT" } }),
    prisma.appSettings.findUnique({ where: { id: "default" } }),
    prisma.roadmap.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        courses: { orderBy: { orderIndex: "asc" } },
      },
    }),
  ]);

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
      <RoadmapManagerClient
        initialRoadmaps={roadmaps.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          description: r.description,
          levelLabel: r.levelLabel,
          status: r.status,
          orderIndex: r.orderIndex,
          courses: r.courses.map((c) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            summary: c.summary,
            status: c.status,
            orderIndex: c.orderIndex,
            passingScore: c.passingScore,
          })),
        }))}
      />
    </AppShell>
  );
}
