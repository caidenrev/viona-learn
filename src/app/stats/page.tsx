import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey, shiftDateKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { getCachedAppSettings } from "@/lib/cached-settings";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import {
  RibbonTag,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import {
  ChartIcon,
  FlameIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/icons/CartoonIcons";
import { STICKERS } from "@/lib/stickers";
import { computeAchievements } from "@/lib/achievements";
import { AchievementBadgesCard } from "@/components/student/AchievementBadgesCard";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

  const todayKey = getJakartaTodayKey();
  const start28Key = shiftDateKey(todayKey, -27);

  const [
    user,
    settings,
    activities,
    attempts,
    ratings,
    totalModules,
    completedModules,
    passedCourses,
    submissionsCount,
    notesCount,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { nickname: true, avatarUrl: true },
    }),
    getCachedAppSettings(),
    prisma.dailyActivity.findMany({
      where: { userId: session.userId },
      orderBy: { dateKey: "desc" },
      take: 60,
      select: { dateKey: true, studyMinutes: true, activityCount: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { course: { select: { title: true } } },
    }),
    prisma.courseRating.findMany({
      where: { userId: session.userId },
      include: { course: { select: { title: true } } },
    }),
    prisma.module.count({
      where: {
        status: "PUBLISHED",
        course: { status: "PUBLISHED", roadmap: { status: "PUBLISHED" } },
      },
    }),
    prisma.moduleProgress.count({ where: { userId: session.userId } }),
    prisma.courseProgress.count({
      where: { userId: session.userId, status: "PASSED" },
    }),
    prisma.courseSubmission.count({ where: { userId: session.userId } }),
    prisma.note.count({ where: { userId: session.userId } }),
  ]);

  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    todayKey
  );
  const bestQuizScore =
    attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
  const achievements = computeAchievements({
    completedModules,
    currentStreak: streak.currentStreak,
    passedCourses,
    bestQuizScore,
    submissionsCount,
    notesCount,
  });
  const totalHours = (
    activities.reduce((s, a) => s + a.studyMinutes, 0) / 60
  ).toFixed(1);
  const avgQuiz =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
      : 0;

  const activityMap = new Map(activities.map((a) => [a.dateKey, a]));
  const last28 = Array.from({ length: 28 }, (_, idx) => {
    const key = shiftDateKey(start28Key, idx);
    const found = activityMap.get(key);
    return {
      key,
      count: found?.activityCount ?? 0,
      minutes: found?.studyMinutes ?? 0,
    };
  });
  const last7 = last28.slice(-7);
  const maxMinutes = Math.max(30, ...last7.map((d) => d.minutes));

  return (
    <AppShell
      role="STUDENT"
      activePath="/stats"
      streakDays={streak.currentStreak}
      userName={user?.nickname || session.name}
      avatarUrl={user?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Viona Learn"}
    >
      <div className="space-y-6">
        <WashiCard tapeColor="pink">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <RibbonTag color="butter" className="mb-2">
                <SparkleIcon className="w-3.5 h-3.5" />
                <span>LAPORAN BELAJAR PERSONAL</span>
              </RibbonTag>
              <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold text-[#4a3e3d]">
                Statistik &amp; Evaluasi Belajar
              </h1>
              <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
                Pantau konsistensi streak harian, nilai mini quiz, dan progres modulmu.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StickerImage
                src={STICKERS.sheet.bowPink}
                alt="Pita Pink"
                className="w-12 h-12"
              />
              <StickerImage
                src={STICKERS.streakStar}
                alt="Bintang Streak"
                className="w-24 h-24"
              />
            </div>
          </div>
        </WashiCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WashiCard tapeColor="pink">
            <div className="flex items-center justify-between mb-1">
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
                Daily Streak
              </span>
              <FlameIcon className="w-5 h-5 text-[#8e4b49]" />
            </div>
            <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold">
              {streak.currentStreak} Hari
            </div>
          </WashiCard>

          <WashiCard tapeColor="yellow">
            <div className="flex items-center justify-between mb-1">
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
                Waktu Belajar
              </span>
              <ChartIcon className="w-5 h-5" />
            </div>
            <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold">
              {totalHours} Jam
            </div>
          </WashiCard>

          <WashiCard tapeColor="lilac">
            <div className="flex items-center justify-between mb-1">
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
                Rata-rata Quiz
              </span>
              <StarIcon filled className="w-5 h-5 text-[#8e4b49]" />
            </div>
            <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold">
              {avgQuiz} / 100
            </div>
          </WashiCard>

          <WashiCard tapeColor="mint">
            <div className="flex items-center justify-between mb-1">
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
                Ketuntasan Modul
              </span>
              <SparkleIcon className="w-5 h-5" />
            </div>
            <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold">
              {completedModules} / {totalModules}
            </div>
          </WashiCard>
        </div>

        <AchievementBadgesCard badges={achievements} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <WashiCard
            tapeColor="yellow"
            title="Aktivitas 7 Hari Terakhir"
            className="lg:col-span-7"
          >
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 bg-[#f6f3ee] rounded-2xl p-4">
              {last7.map((d) => {
                const heightPct = Math.max(8, Math.round((d.minutes / maxMinutes) * 100));
                return (
                  <div
                    key={d.key}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"
                  >
                    <span className="font-[family-name:var(--font-mali)] text-[10px] font-bold text-[#534342]">
                      {d.minutes}m
                    </span>
                    <div
                      className="w-full max-w-[36px] rounded-t-xl bg-[#FFAAA6] border border-[#8e4b49]/30"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="font-[family-name:var(--font-mali)] text-[11px] text-[#8d6e63]">
                      {d.key.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#534342] mb-2">
                Heatmap 4 Pekan Terakhir
              </div>
              <div className="grid grid-cols-7 gap-1.5 bg-[#f6f3ee] p-3 rounded-2xl">
                {last28.map((d) => (
                  <div
                    key={d.key}
                    title={`${d.key}: ${d.count} aktivitas`}
                    className={`aspect-square rounded-lg flex items-center justify-center font-[family-name:var(--font-mali)] text-[10px] font-bold ${
                      d.count >= 3
                        ? "bg-[#FFAAA6] text-[#4a3e3d]"
                        : d.count >= 1
                          ? "bg-[#FFF3B0] text-[#4a3e3d]"
                          : "bg-white text-[#8d6e63]"
                    }`}
                  >
                    {d.count > 0 ? d.count : "-"}
                  </div>
                ))}
              </div>
            </div>
          </WashiCard>

          <div className="lg:col-span-5 space-y-6">
            <WashiCard
              tapeColor="lilac"
              title="Riwayat Mini Quiz"
              badge={
                <StickerImage
                  src={STICKERS.sheet.catBooks}
                  alt="Kucing Buku"
                  className="w-9 h-9"
                />
              }
            >
              <ul className="space-y-2.5">
                {attempts.slice(0, 6).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-[#faf7f2] px-3 py-2 border border-[#eadfd5]"
                  >
                    <span className="font-[family-name:var(--font-patrick-hand)] text-base truncate">
                      {a.course.title}
                    </span>
                    <RibbonTag color={a.passed ? "mint" : "pink"}>
                      {a.score}% ({a.passed ? "Lulus" : "Ulang"})
                    </RibbonTag>
                  </li>
                ))}
                {attempts.length === 0 && (
                  <li className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63]">
                    Belum ada percobaan Mini Quiz.
                  </li>
                )}
              </ul>
            </WashiCard>

            <WashiCard tapeColor="mint" title="Rating Course Kamu">
              <ul className="space-y-2.5">
                {ratings.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl bg-[#faf7f2] p-3 border border-[#eadfd5]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="font-[family-name:var(--font-mali)] text-xs font-bold">
                        {r.course.title}
                      </strong>
                      <RibbonTag color="butter">{r.stars} / 5 Bintang</RibbonTag>
                    </div>
                    {r.review && (
                      <p className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#534342] mt-1">
                        {r.review}
                      </p>
                    )}
                  </li>
                ))}
                {ratings.length === 0 && (
                  <li className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63]">
                    Selesaikan course &amp; lulus quiz untuk memberi rating pertamamu!
                  </li>
                )}
              </ul>
            </WashiCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
