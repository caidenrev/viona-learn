"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookStackIcon,
  CalendarIcon,
  ChartIcon,
  CodeIcon,
  FlameIcon,
  PencilIcon,
  SettingsIcon,
  SparkleIcon,
} from "@/components/icons/CartoonIcons";
import { STICKERS } from "@/lib/stickers";
import { VionaLogo } from "@/components/icons/VionaLogo";

export interface AppNavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: "book" | "notes" | "code" | "chart" | "calendar" | "mentor" | "settings";
}

function renderNavIcon(kind: AppNavItem["icon"]) {
  switch (kind) {
    case "book":
      return <BookStackIcon className="w-4 h-4 shrink-0" />;
    case "notes":
      return <PencilIcon className="w-4 h-4 shrink-0" />;
    case "code":
      return <CodeIcon className="w-4 h-4 shrink-0" />;
    case "chart":
      return <ChartIcon className="w-4 h-4 shrink-0" />;
    case "calendar":
      return <CalendarIcon className="w-4 h-4 shrink-0" />;
    case "mentor":
      return <SparkleIcon className="w-4 h-4 shrink-0" />;
    case "settings":
      return <SettingsIcon className="w-4 h-4 shrink-0" />;
  }
}

export function AppHeader({
  role,
  activePath,
  navItems,
  streakDays,
  userName,
  avatarUrl,
  siteTitle,
}: {
  role: "TEACHER" | "STUDENT";
  activePath: string;
  navItems: AppNavItem[];
  streakDays: number;
  userName: string;
  avatarUrl?: string | null;
  siteTitle: string;
}) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [activePath]);

  const effectivePath = pendingHref ?? activePath;
  const isNavigating = pendingHref !== null && pendingHref !== activePath;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#fcf9f4]/90 backdrop-blur-xl border-b border-[#eadfd5]">
        <div className="h-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-3">
          <Link
            href={role === "TEACHER" ? "/admin" : "/workspace"}
            prefetch={true}
            onClick={() =>
              setPendingHref(role === "TEACHER" ? "/admin" : "/workspace")
            }
            className="flex items-center gap-2 min-w-0 shrink"
          >
            <VionaLogo className="w-7 h-7 shrink-0" />
            <span className="font-[family-name:var(--font-gaegu)] text-xl sm:text-2xl font-bold text-[#8e4b49] tracking-tight truncate">
              {siteTitle}
            </span>
          </Link>

          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-2 flex-wrap"
          >
            {navItems.map((item) => {
              const active =
                effectivePath === item.href ||
                (item.href !== "/admin" && effectivePath.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setPendingHref(item.href)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-[family-name:var(--font-mali)] text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#FFAAA6] text-[#4a3e3d] shadow-xs"
                      : "text-[#534342] hover:bg-[#f6f3ee]"
                  }`}
                >
                  {renderNavIcon(item.icon)}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="bg-[#FFF3B0] text-[#4a3e3d] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 font-[family-name:var(--font-mali)] text-xs font-bold border border-[#f0e088]">
              <FlameIcon className="w-4 h-4 text-[#8e4b49]" />
              <span>{streakDays} Hari</span>
            </div>
            <Link
              href={role === "TEACHER" ? "/admin/settings" : "/settings"}
              prefetch={true}
              onClick={() =>
                setPendingHref(
                  role === "TEACHER" ? "/admin/settings" : "/settings"
                )
              }
              aria-label={`Pengaturan akun ${userName}`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 transition-transform hover:scale-105"
            >
              <img
                src={avatarUrl || STICKERS.mascotHirono}
                alt={userName}
                className="w-10 h-10 object-contain drop-shadow-[0_2px_4px_rgba(141,110,99,0.2)]"
              />
            </Link>
          </div>
        </div>
        {isNavigating && (
          <div
            aria-label="Memuat halaman"
            className="h-1 w-full bg-[#f6f3ee] overflow-hidden"
          >
            <div className="h-full w-2/3 rounded-full bg-[#FFAAA6] animate-pulse" />
          </div>
        )}
      </header>

      <nav
        aria-label="Navigasi Mobile"
        className="md:hidden fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 px-3 pointer-events-none flex justify-center"
      >
        <div className="pointer-events-auto w-full max-w-md rounded-full bg-[#ffffff]/95 backdrop-blur-md border-2 border-dashed border-[#eadfd5] shadow-[0_0_0_3px_rgba(255,255,255,0.85),0_10px_24px_rgba(141,110,99,0.16)] p-1.5 flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const active =
              effectivePath === item.href ||
              (item.href !== "/admin" && effectivePath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setPendingHref(item.href)}
                className={`flex-1 min-w-0 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-full px-1.5 py-1 font-[family-name:var(--font-mali)] text-[11px] font-bold transition-all active:scale-95 ${
                  active
                    ? "bg-[#ffdad8] text-[#7a3c3a] shadow-xs"
                    : "text-[#534342] hover:bg-[#f6f3ee]"
                }`}
              >
                {renderNavIcon(item.icon)}
                <span className="truncate max-w-full">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
