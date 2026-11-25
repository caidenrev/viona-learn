"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckRibbonIcon,
  FlameIcon,
  LockIcon,
  PencilIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/icons/CartoonIcons";
import { PomodoroWidget } from "@/components/student/PomodoroWidget";
import { AchievementBadgesCard } from "@/components/student/AchievementBadgesCard";
import type { AchievementBadge } from "@/lib/achievements";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  TanyaHusbandButton,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { STICKERS } from "@/lib/stickers";

export interface WorkspaceCourse {
  id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string | null;
  targetDate: string | null;
  orderIndex: number;
  effectiveStatus: "LOCKED" | "UNLOCKED" | "PASSED";
  bestScore: number;
  totalModules: number;
  completedModules: number;
}

export interface WorkspaceRoadmap {
  id: string;
  title: string;
  slug: string;
  description: string;
  levelLabel: string;
  courses: WorkspaceCourse[];
}

export interface WorkspaceTaskItem {
  id: string;
  title: string;
  completed: boolean;
  category: "STUDY" | "PERSONAL";
  isTodayGoal: boolean;
}

export interface WorkspaceNoteItem {
  id: string;
  title: string;
  body: string;
  color: "PINK" | "BUTTER" | "MINT" | "LAV";
}

function buildMiniCalendarDays(todayKey: string, activeDates: Set<string>) {
  const [y, m] = todayKey.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: Math.min(daysInMonth, 28) }, (_, idx) => {
    const day = idx + 1;
    const key = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return {
      day,
      key,
      active: activeDates.has(key),
      isToday: key === todayKey,
    };
  });
}

export function BentoWorkspaceClient({
  userName,
  teacherWhatsapp,
  todayKey,
  initialStreak,
  achievements,
  roadmaps,
  initialTasks,
  initialNotes,
  activeDates,
}: {
  userName: string;
  teacherWhatsapp: string;
  todayKey: string;
  initialStreak: { currentStreak: number; activeToday: boolean };
  achievements: AchievementBadge[];
  roadmaps: WorkspaceRoadmap[];
  initialTasks: WorkspaceTaskItem[];
  initialNotes: WorkspaceNoteItem[];
  activeDates: string[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [notes, setNotes] = useState(initialNotes);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(
    roadmaps[0]?.id ?? ""
  );

  const activeRoadmap =
    roadmaps.find((r) => r.id === selectedRoadmapId) ?? roadmaps[0] ?? null;

  const allCourses = roadmaps.flatMap((r) => r.courses);
  const totalModules = allCourses.reduce((s, c) => s + c.totalModules, 0);
  const completedModules = allCourses.reduce(
    (s, c) => s + c.completedModules,
    0
  );
  const overallPercent =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const activeCourse =
    activeRoadmap?.courses.find((c) => c.effectiveStatus === "UNLOCKED") ??
    activeRoadmap?.courses[0];

  const miniDays = buildMiniCalendarDays(todayKey, new Set(activeDates));

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const res = await fetch("/api/student/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle.trim(),
        category: "STUDY",
        isTodayGoal: true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => [data.task, ...prev]);
      setNewTaskTitle("");
    }
  }

  async function toggleTask(task: WorkspaceTaskItem) {
    const next = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t))
    );
    await fetch(`/api/student/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: next }),
    });
  }

  async function addQuickNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteBody.trim()) return;
    const res = await fetch("/api/student/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Catatan Harian",
        body: newNoteBody.trim(),
        color: "BUTTER",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setNewNoteBody("");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Welcome Motivation Banner */}
      <WashiCard tapeColor="pink" className="p-5 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <RibbonTag color="pink">
                <SparkleIcon className="w-4 h-4" />
                <span>BELAJAR YUK!</span>
              </RibbonTag>
              <RibbonTag color="butter">
                <FlameIcon className="w-4 h-4 text-[#8e4b49]" />
                <span>{initialStreak.currentStreak} Hari Berturut-turut</span>
              </RibbonTag>
            </div>

            <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold text-[#4a3e3d] leading-tight">
              Semangat {userName}! Yuk lanjutkan progres belajarmu
            </h1>
            <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
              Sedikit demi sedikit, lama-lama jadi mahir! Target roadmap menunggumu hari ini.
            </p>

            <div className="bg-[#f6f3ee] rounded-2xl p-4 border border-[#eadfd5] max-w-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-[family-name:var(--font-mali)] text-sm font-bold text-[#4a3e3d]">
                  Target Kurikulum
                </span>
                <span className="font-[family-name:var(--font-mali)] text-sm font-bold text-[#8e4b49]">
                  {completedModules}/{totalModules} Modul Selesai ({overallPercent}%)
                </span>
              </div>
              <div className="w-full h-4 bg-[#e5e2dd] rounded-full overflow-hidden p-0.5 border border-[#dedad4]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c6e9ee] via-[#C8B6FF] to-[#FFAAA6] transition-all duration-500"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>

            {activeCourse && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={`/learn/${activeCourse.slug}`}
                  className="squishy-btn inline-flex items-center gap-2 rounded-full bg-[#8e4b49] text-white px-5 py-2.5 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold"
                >
                  <span>Lanjut: {activeCourse.title}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <TanyaHusbandButton
                  phone={teacherWhatsapp}
                  courseTitle={activeCourse.title}
                  moduleTitle="Dashboard Roadmap"
                />
              </div>
            )}
          </div>

          <div className="relative shrink-0">
            <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-3xl bg-[#faf7f2] p-3 border-2 border-dashed border-[#eadfd5] rotate-2 flex items-center justify-center shadow-sm">
              <StickerImage
                src={STICKERS.welcomeBunny}
                alt="Kelinci Belajar"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </WashiCard>

      {/* 2. Main 12-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Winding Stepped Roadmap (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase tracking-wider text-[#645495]">
                Kurikulum Personal
              </span>
              <h2 className="font-[family-name:var(--font-gaegu)] text-3xl font-bold text-[#4a3e3d]">
                {activeRoadmap?.title ?? "Belum Ada Roadmap"}
              </h2>
            </div>

            {roadmaps.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {roadmaps.map((rm) => (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => setSelectedRoadmapId(rm.id)}
                    className={`px-3.5 py-2 rounded-full min-h-[44px] font-[family-name:var(--font-mali)] text-xs font-bold border transition-colors ${
                      rm.id === activeRoadmap?.id
                        ? "bg-[#C8B6FF] text-[#200d4e] border-[#645495]"
                        : "bg-white text-[#534342] border-[#eadfd5]"
                    }`}
                  >
                    {rm.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!activeRoadmap || activeRoadmap.courses.length === 0 ? (
            <WashiCard tapeColor="mint">
              <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
                Teacher belum mempublikasikan course di roadmap ini. Tunggu sebentar ya!
              </p>
            </WashiCard>
          ) : (
            <div className="flex flex-col gap-4">
              {activeRoadmap.courses.map((course, idx) => {
                const isActive = course.effectiveStatus === "UNLOCKED";
                const isPassed = course.effectiveStatus === "PASSED";
                const isLocked = course.effectiveStatus === "LOCKED";
                const pct =
                  course.totalModules > 0
                    ? Math.round(
                        (course.completedModules / course.totalModules) * 100
                      )
                    : 0;

                return (
                  <div
                    key={course.id}
                    className={`relative rounded-3xl p-5 border-2 border-dashed transition-transform ${
                      isActive
                        ? "bg-[#fff2f1] border-[#FFAAA6] shadow-[0_8px_20px_rgba(142,75,73,0.12)]"
                        : isLocked
                          ? "bg-[#f6f3ee] border-[#eadfd5] opacity-85"
                          : "bg-white border-[#eadfd5] shadow-sm"
                    } ${idx % 2 === 1 ? "lg:ml-6" : "lg:mr-6"}`}
                  >
                    {isActive && (
                      <div className="mb-3">
                        <RibbonTag color="pink">
                          <SparkleIcon className="w-3.5 h-3.5" />
                          <span>MODUL AKTIF</span>
                        </RibbonTag>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border ${
                            isPassed
                              ? "bg-[#c6e9ee] text-[#001f23] border-[#a4c6cb]"
                              : isActive
                                ? "bg-[#FFAAA6] text-[#4a3e3d] border-[#ffdad8]"
                                : "bg-[#e5e2dd] text-[#534342] border-[#d8c1c0]"
                          }`}
                        >
                          {isPassed ? (
                            <CheckRibbonIcon className="w-6 h-6" />
                          ) : isLocked ? (
                            <LockIcon className="w-5 h-5" />
                          ) : (
                            <SparkleIcon className="w-6 h-6" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <RibbonTag
                              color={
                                isPassed ? "mint" : isActive ? "pink" : "lilac"
                              }
                            >
                              {isPassed
                                ? `Lulus - Skor ${course.bestScore}%`
                                : isActive
                                  ? `Diproses (${pct}%)`
                                  : "Terkunci Quiz"}
                            </RibbonTag>
                            {course.targetDate && (
                              <span className="inline-flex items-center gap-1 font-[family-name:var(--font-patrick-hand)] text-sm text-[#8d6e63]">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                Target:{" "}
                                {new Date(course.targetDate).toLocaleDateString(
                                  "id-ID",
                                  { day: "numeric", month: "short" }
                                )}
                              </span>
                            )}
                          </div>
                          <h3 className="font-[family-name:var(--font-gaegu)] text-2xl font-bold text-[#4a3e3d] break-words">
                            {course.title}
                          </h3>
                          <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342] break-words">
                            {course.summary}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-[#ebe8e3] text-[#534342] font-[family-name:var(--font-mali)] text-xs font-bold">
                            <LockIcon className="w-4 h-4" />
                            <span>Luluskan Sebelumnya</span>
                          </span>
                        ) : (
                          <Link
                            href={`/learn/${course.slug}`}
                            className="squishy-btn inline-flex items-center justify-center gap-2 rounded-full bg-[#8e4b49] text-white px-5 py-2.5 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold whitespace-nowrap"
                          >
                            <span>
                              {isPassed ? "Ulas Materi" : "Lanjut Belajar"}
                            </span>
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-4 w-full h-3 bg-white rounded-full overflow-hidden p-0.5 border border-[#FFAAA6]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FFAAA6] to-[#8e4b49] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <AchievementBadgesCard badges={achievements} compact />
        </div>

        {/* Right: Pomodoro, Mini Streak Calendar, To-Do List, My Notes! (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
          <PomodoroWidget />

          <WashiCard
            tapeColor="mint"
            title="Kalender Streak"
            badge={
              <RibbonTag color="butter">
                <StarIcon filled className="w-3.5 h-3.5 text-[#8e4b49]" />
                <span>{initialStreak.currentStreak} Hari</span>
              </RibbonTag>
            }
          >
            <div className="grid grid-cols-7 gap-1.5">
              {miniDays.map((d) => (
                <div
                  key={d.key}
                  className={`h-8 rounded-lg flex items-center justify-center font-[family-name:var(--font-mali)] text-xs font-bold border ${
                    d.active
                      ? "bg-[#FFAAA6] text-[#4a3e3d] border-[#8e4b49]"
                      : d.isToday
                        ? "bg-[#FFF3B0] text-[#4a3e3d] border-[#8d6e63]"
                        : "bg-[#faf7f2] text-[#8d6e63] border-[#eadfd5]"
                  }`}
                >
                  {d.day}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#534342]">
                Bisa kok! Pertahankan streak harianmu.
              </span>
              <Link
                href="/calendar"
                className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#8e4b49] underline shrink-0"
              >
                Buka Kalender
              </Link>
            </div>
          </WashiCard>

          <WashiCard
            tapeColor="pink"
            title="TO-DO LIST"
            badge={
              <StickerImage
                src={STICKERS.sheet.todoCirclePink}
                alt="To Do"
                className="w-9 h-9"
              />
            }
          >
            <form onSubmit={addTask} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Tambah target hari ini..."
                className="flex-1 min-w-0 min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 py-2 font-[family-name:var(--font-patrick-hand)] text-base"
              />
              <SquishyButton type="submit" variant="butter" className="px-4">
                Tambah
              </SquishyButton>
            </form>

            <ul className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className="w-full min-h-[44px] flex items-center gap-3 rounded-2xl px-3 py-2 bg-[#faf7f2] hover:bg-[#fff2f1] text-left transition-colors"
                  >
                    <span
                      className={`w-5 h-5 rounded-md border-2 border-[#4a3e3d] flex items-center justify-center shrink-0 ${
                        task.completed ? "bg-[#FFAAA6]" : "bg-white"
                      }`}
                    >
                      {task.completed && (
                        <CheckRibbonIcon className="w-4 h-4 text-[#4a3e3d]" />
                      )}
                    </span>
                    <span
                      className={`font-[family-name:var(--font-patrick-hand)] text-base flex-1 min-w-0 break-words ${
                        task.completed ? "line-through text-[#8d6e63]" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#8d6e63]">
                  Belum ada tugas hari ini. Yuk tambah target pertamamu!
                </li>
              )}
            </ul>
          </WashiCard>

          <WashiCard
            tapeColor="brown"
            title="MY NOTES!"
            className="lined-memo"
            badge={
              <PencilIcon className="w-5 h-5 text-[#4a3e3d]" />
            }
          >
            <form onSubmit={addQuickNote} className="space-y-2 mb-3">
              <textarea
                rows={2}
                value={newNoteBody}
                onChange={(e) => setNewNoteBody(e.target.value)}
                placeholder="Tulis catatan singkatmu di sini..."
                className="w-full rounded-2xl bg-white/80 border border-[#e2d38b] p-3 font-[family-name:var(--font-patrick-hand)] text-base focus:outline-none"
              />
              <SquishyButton type="submit" variant="primary" className="w-full">
                Simpan Memo
              </SquishyButton>
            </form>
            <div className="space-y-2">
              {notes.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl bg-white/85 border border-[#e2d38b] p-3"
                >
                  <div className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#8e4b49]">
                    {n.title}
                  </div>
                  <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#4a3e3d] break-words">
                    {n.body}
                  </p>
                </div>
              ))}
            </div>
          </WashiCard>
        </div>
      </div>
    </div>
  );
}
