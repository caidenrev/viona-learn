import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { getCachedAppSettings } from "@/lib/cached-settings";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileSettingsClient } from "@/components/settings/ProfileSettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const [user, settings, activities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        nickname: true,
        dreamTarget: true,
        bio: true,
        focusWindow: true,
        avatarUrl: true,
        username: true,
        role: true,
      },
    }),
    getCachedAppSettings(),
    prisma.dailyActivity.findMany({
      where: { userId: session.userId },
      orderBy: { dateKey: "desc" },
      take: 90,
      select: { dateKey: true },
    }),
  ]);

  if (!user) redirect("/login");

  const streak = calculateCurrentStreak(
    activities.map((a) => a.dateKey),
    getJakartaTodayKey()
  );

  return (
    <AppShell
      role={session.role}
      activePath="/settings"
      streakDays={streak.currentStreak}
      userName={user.nickname || user.name}
      avatarUrl={user.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Viona Learn"}
    >
      <ProfileSettingsClient
        user={{
          name: user.name,
          nickname: user.nickname,
          dreamTarget: user.dreamTarget,
          bio: user.bio,
          focusWindow: user.focusWindow,
          avatarUrl: user.avatarUrl,
          username: user.username,
          role: user.role,
        }}
      />
    </AppShell>
  );
}
