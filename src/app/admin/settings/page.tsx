import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";
import { AppShell } from "@/components/layout/AppShell";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "TEACHER") redirect("/workspace");

  const [teacher, student, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.user.findUnique({ where: { role: "STUDENT" } }),
    prisma.appSettings.findUnique({ where: { id: "default" } }),
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
      activePath="/admin/settings"
      streakDays={streak.currentStreak}
      userName={teacher?.name || session.name}
      avatarUrl={teacher?.avatarUrl}
      siteTitle={settings?.siteTitle ?? "Viona Learn"}
    >
      <AdminSettingsClient
        initialWhatsapp={settings?.teacherWhatsapp ?? "6281234567890"}
        initialSiteTitle={settings?.siteTitle ?? "Viona Learn"}
        studentUsername={student?.username ?? "viona"}
      />
    </AppShell>
  );
}
