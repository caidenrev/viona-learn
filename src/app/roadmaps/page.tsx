import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { computeRoadmapCourseStates } from "@/lib/progression";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { RibbonTag, StickerImage, WashiCard } from "@/components/ui/PastelPrimitives";
import { ArrowRightIcon, BookStackIcon } from "@/components/icons/CartoonIcons";
import { STICKERS } from "@/lib/stickers";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

  const [user, settings, roadmaps, progresses, activities] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.appSettings.findUnique({ where: { id: "default" } }),
    prisma.roadmap.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { orderIndex: "asc" },
      include: {
        courses: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
          select: { id: true, orderIndex: true, status: true },
        },
      },
    }),
    prisma.courseProgress.findMany({ where: { userId: session.userId } }),
    prisma.dailyActivity.findMany({ where: { userId: session.userId } }),
  ]);

  const progressMap = new Map(
    progresses.map((p) => [p.courseId, { status: p.status, bestScore: p.bestScore }])
  );
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
      siteTitle={settings?.siteTitle ?? "Viona Learn"}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <RibbonTag color="lilac">Kurikulum Terstruktur</RibbonTag>
            <h1 className="mt-2 font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold">
              Semua Roadmap Belajar
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StickerImage
              src={STICKERS.sheet.backpackPink}
              alt="Tas Belajar"
              className="w-14 h-14"
            />
            <StickerImage
              src={STICKERS.welcomeBunny}
              alt="Kelinci Belajar"
              className="w-20 h-20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmaps.map((rm) => {
            const states = computeRoadmapCourseStates(rm.courses, progressMap);
            const passed = states.filter((s) => s.effectiveStatus === "PASSED").length;
            return (
              <WashiCard
                key={rm.id}
                tapeColor="pink"
                title={rm.title}
                badge={<RibbonTag color="butter">{rm.levelLabel}</RibbonTag>}
              >
                <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342] mb-4">
                  {rm.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mali)] text-xs font-bold text-[#8d6e63]">
                    <BookStackIcon className="w-4 h-4" />
                    {passed}/{states.length} Course Lulus
                  </span>
                  <Link
                    href={`/roadmaps/${rm.slug}`}
                    className="squishy-btn inline-flex items-center gap-2 rounded-full bg-[#FFAAA6] text-[#4a3e3d] px-4 py-2 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold"
                  >
                    <span>Lihat Jalur</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </WashiCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
