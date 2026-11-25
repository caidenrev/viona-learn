import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { CodePlaygroundClient } from "@/components/student/CodePlaygroundClient";

export const dynamic = "force-dynamic";

export default async function PlaygroundPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "STUDENT") redirect("/admin");

  const [user, settings, activities] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.appSettings.findUnique({ where: { id: "default" } }),
    prisma.dailyActivity.findMany({ where: { userId: session.userId } }),
  ]);

  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  return (
    <AppShell
      role="STUDENT"
      activePath="/playground"
      streakDays={streak.currentStreak}
      userName={user?.nickname || session.name}
      avatarUrl={user?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Viona Learn"}
    >
      <CodePlaygroundClient />
    </AppShell>
  );
}
