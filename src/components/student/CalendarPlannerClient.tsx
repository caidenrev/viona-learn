"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, FlameIcon } from "@/components/icons/CartoonIcons";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { STICKERS } from "@/lib/stickers";

interface CalendarEventItem {
  id: string;
  type: "ROADMAP_TARGET" | "COURSE_TARGET" | "TASK_DUE";
  title: string;
  dateKey: string;
  completed?: boolean;
}

export function CalendarPlannerClient({
  initialMonth,
  initialEvents,
  initialStreakDays,
}: {
  initialMonth: string;
  initialEvents: CalendarEventItem[];
  initialStreakDays: Array<{ dateKey: string; activityCount: number }>;
}) {
  const [month, setMonth] = useState(initialMonth);
  const [events, setEvents] = useState(initialEvents);
  const [streakDays, setStreakDays] = useState(initialStreakDays);
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    if (month === initialMonth) return;
    fetch(`/api/student/calendar?month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setStreakDays(data.streakDays ?? []);
      });
  }, [month, initialMonth]);

  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const streakSet = new Set(streakDays.map((s) => s.dateKey));

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(year, mon - 1 + delta, 1));
    setMonth(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    );
    setSelectedDay("");
  }

  const dayEvents = selectedDay
    ? events.filter((e) => e.dateKey === selectedDay)
    : events;

  return (
    <div className="space-y-6">
      <WashiCard tapeColor="mint">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <RibbonTag color="butter" className="mb-2">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>PLANNER &amp; TARGET ROADMAP</span>
            </RibbonTag>
            <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold">
              Kalender Belajar Bulanan
            </h1>
            <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
              Target tanggal dari Teacher dan tugas pribadimu tergabung rapi di sini.
            </p>
          </div>
          <StickerImage
            src={STICKERS.sheet.calendarHearts}
            alt="Kalender Lucu"
            className="w-24 h-24 shrink-0"
          />
        </div>
      </WashiCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <WashiCard
          tapeColor="pink"
          title={`Bulan ${month}`}
          className="lg:col-span-8"
          badge={
            <div className="flex gap-2">
              <SquishyButton type="button" variant="outline" onClick={() => shiftMonth(-1)}>
                Prev
              </SquishyButton>
              <SquishyButton type="button" variant="outline" onClick={() => shiftMonth(1)}>
                Next
              </SquishyButton>
            </div>
          }
        >
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const day = idx + 1;
              const dateKey = `${month}-${String(day).padStart(2, "0")}`;
              const hasEvent = events.some((e) => e.dateKey === dateKey);
              const hasStreak = streakSet.has(dateKey);
              const isSelected = selectedDay === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDay(isSelected ? "" : dateKey)}
                  className={`min-h-[44px] sm:min-h-[56px] rounded-xl sm:rounded-2xl p-1 sm:p-1.5 border flex flex-col items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-[#C8B6FF] border-[#645495]"
                      : hasStreak
                        ? "bg-[#ffdad8]/65 border-[#FFAAA6]"
                        : hasEvent
                          ? "bg-[#FFF3B0]/80 border-[#e2d38b]"
                          : "bg-[#faf7f2] border-[#eadfd5]"
                  }`}
                >
                  <span className="font-[family-name:var(--font-mali)] text-xs font-bold">
                    {day}
                  </span>
                  <div className="flex items-center gap-1">
                    {hasStreak && <FlameIcon className="w-3.5 h-3.5 text-[#8e4b49]" />}
                    {hasEvent && (
                      <span className="w-2 h-2 rounded-full bg-[#645495]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </WashiCard>

        <WashiCard
          tapeColor="yellow"
          title={selectedDay ? `Agenda ${selectedDay}` : "Semua Agenda Bulan Ini"}
          className="lg:col-span-4"
        >
          <ul className="space-y-2.5">
            {dayEvents.map((ev) => (
              <li
                key={ev.id}
                className="rounded-2xl bg-[#faf7f2] p-3 border border-[#eadfd5]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <RibbonTag
                    color={
                      ev.type === "ROADMAP_TARGET"
                        ? "lilac"
                        : ev.type === "COURSE_TARGET"
                          ? "pink"
                          : "butter"
                    }
                  >
                    {ev.type === "ROADMAP_TARGET"
                      ? "Target Roadmap"
                      : ev.type === "COURSE_TARGET"
                        ? "Target Course"
                        : "Tugas"}
                  </RibbonTag>
                  <span className="font-[family-name:var(--font-mali)] text-[11px] text-[#8d6e63]">
                    {ev.dateKey}
                  </span>
                </div>
                <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#4a3e3d]">
                  {ev.title}
                </p>
              </li>
            ))}
            {dayEvents.length === 0 && (
              <li className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63]">
                Belum ada target atau tugas di tanggal ini.
              </li>
            )}
          </ul>
        </WashiCard>
      </div>
    </div>
  );
}
