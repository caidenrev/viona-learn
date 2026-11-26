import type { ReactNode } from "react";
import { AppHeader, type AppNavItem } from "@/components/layout/AppNavBars";

const STUDENT_NAV: AppNavItem[] = [
  { href: "/workspace", label: "Dashboard & Roadmap", shortLabel: "Home", icon: "book" },
  { href: "/notes", label: "Catatan & Tugas", shortLabel: "Catatan", icon: "notes" },
  { href: "/playground", label: "Code Playground", shortLabel: "Koding", icon: "code" },
  { href: "/stats", label: "Statistik", shortLabel: "Statistik", icon: "chart" },
  { href: "/calendar", label: "Kalender", shortLabel: "Kalender", icon: "calendar" },
];

const TEACHER_NAV: AppNavItem[] = [
  { href: "/admin", label: "Konsol Mentor", shortLabel: "Konsol", icon: "mentor" },
  { href: "/admin/roadmaps", label: "Roadmap & Course", shortLabel: "Kurikulum", icon: "book" },
  { href: "/admin/settings", label: "Pengaturan", shortLabel: "Setelan", icon: "settings" },
];

export function AppShell({
  role,
  activePath,
  streakDays = 0,
  userName,
  avatarUrl,
  siteTitle = "Viona Learn",
  children,
}: {
  role: "TEACHER" | "STUDENT";
  activePath: string;
  streakDays?: number;
  userName: string;
  avatarUrl?: string | null;
  siteTitle?: string;
  children: ReactNode;
}) {
  const navItems = role === "TEACHER" ? TEACHER_NAV : STUDENT_NAV;

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f4] text-[#4a3e3d] overflow-x-hidden">
      <AppHeader
        role={role}
        activePath={activePath}
        navItems={navItems}
        streakDays={streakDays}
        userName={userName}
        avatarUrl={avatarUrl}
        siteTitle={siteTitle}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-5 sm:py-6 pb-28 md:pb-10 min-w-0">
        {children}
      </main>

      <footer className="hidden md:block py-4 text-center font-[family-name:var(--font-patrick-hand)] text-sm text-[#8d6e63] border-t border-[#eadfd5]/60">
        Semangat belajarnya hari ini! - {siteTitle} Personal Study Planner
      </footer>
    </div>
  );
}
