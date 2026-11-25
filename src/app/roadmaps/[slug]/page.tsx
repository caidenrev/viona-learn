import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { computeRoadmapCourseStates } from "@/lib/progression";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { RibbonTag, WashiCard } from "@/components/ui/PastelPrimitives";
import { ArrowRightIcon, CheckRibbonIcon, LockIcon } from "@/components/icons/CartoonIcons";

export const dynamic = "force-dynamic";

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

  const { slug } = await params;

  const [user, settings, roadmap, progresses, activities] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.appSettings.findUnique({ where: { id: "default" } }),
    prisma.roadmap.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        courses: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
        },
      },
    }),
    prisma.courseProgress.findMany({ where: { userId: session.userId } }),
    prisma.dailyActivity.findMany({ where: { userId: session.userId } }),
  ]);

  if (!roadmap) notFound();

  const progressMap = new Map(
    progresses.map((p) => [p.courseId, { status: p.status, bestScore: p.bestScore }])
  );
  const states = computeRoadmapCourseStates(roadmap.courses, progressMap);
  const stateMap = new Map(states.map((s) => [s.courseId, s]));
  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  return (
    <AppShell
      role="STUDENT"
      activePath="/roadmaps"
      streakDays={streak.currentStreak}
      userName={user?.nickname || session.name}
      avatarUrl={user?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Belajar Yuk!"}
    >
      <div className="space-y-6">
        <WashiCard
          tapeColor="lilac"
          title={roadmap.title}
          badge={<RibbonTag color="butter">{roadmap.levelLabel}</RibbonTag>}
        >
          <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
            {roadmap.description}
          </p>
        </WashiCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap.courses.map((course) => {
            const state = stateMap.get(course.id);
            const status = state?.effectiveStatus ?? "LOCKED";
            return (
              <WashiCard
                key={course.id}
                tapeColor={status === "PASSED" ? "mint" : status === "UNLOCKED" ? "pink" : "yellow"}
                title={course.title}
                badge={
                  <RibbonTag color={status === "PASSED" ? "mint" : status === "UNLOCKED" ? "pink" : "lilac"}>
                    {status === "PASSED"
                      ? `Lulus (${state?.bestScore ?? 0}%)`
                      : status === "UNLOCKED"
                        ? "Terbuka"
                        : "Terkunci"}
                  </RibbonTag>
                }
              >
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-2xl border border-[#eadfd5] mb-3"
                  />
                )}
                <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342] mb-4">
                  {course.summary}
                </p>
                {status === "LOCKED" ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-[family-name:var(--font-mali)] font-bold text-[#8d6e63]">
                    <LockIcon className="w-4 h-4" />
                    Luluskan course sebelumnya dulu
                  </span>
                ) : (
                  <Link
                    href={`/learn/${course.slug}`}
                    className="squishy-btn inline-flex items-center gap-2 rounded-full bg-[#8e4b49] text-white px-4 py-2 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold"
                  >
                    {status === "PASSED" && <CheckRibbonIcon className="w-4 h-4" />}
                    <span>{status === "PASSED" ? "Ulas Materi" : "Mulai Belajar"}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                )}
              </WashiCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
