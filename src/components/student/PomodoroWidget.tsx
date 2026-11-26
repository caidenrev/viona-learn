"use client";

import { useEffect, useState } from "react";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { CoffeeIcon, SparkleIcon } from "@/components/icons/CartoonIcons";
import { STICKERS } from "@/lib/stickers";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function PomodoroWidget() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  function switchMode(next: "focus" | "break") {
    setRunning(false);
    setMode(next);
    setSecondsLeft(next === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <WashiCard
      tapeColor="lilac"
      className="bg-[#f7f3ff]"
      badge={
        <div className="flex items-center gap-1.5">
          <StickerImage
            src={
              mode === "focus"
                ? STICKERS.sheet.alarmClock
                : STICKERS.sheet.bubbleRehatDulu
            }
            alt={mode === "focus" ? "Jam Fokus" : "Rehat Dulu"}
            className="h-7 w-auto"
          />
          <RibbonTag color={mode === "focus" ? "lilac" : "butter"}>
            <SparkleIcon className="w-3.5 h-3.5" />
            <span>{mode === "focus" ? "Fokus Yaa!" : "Rehat Dulu"}</span>
          </RibbonTag>
        </div>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-gaegu)] text-4xl sm:text-5xl font-bold text-[#4a3e3d] tracking-wider">
            {mm}:{ss}
          </div>
          <p className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#8d6e63]">
            {mode === "focus"
              ? "Timer belajar 25 menit tanpa distraksi."
              : "Istirahat 5 menit, minum air dulu ya."}
          </p>
        </div>
        <StickerImage
          src={
            mode === "focus"
              ? STICKERS.pomodoroCat
              : STICKERS.sheet.coffeeSemangat
          }
          alt={mode === "focus" ? "Kucing Fokus" : "Kopi Semangat"}
          className="w-20 h-20 shrink-0"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SquishyButton
          type="button"
          variant="primary"
          onClick={() => setRunning((r) => !r)}
          className="flex-1 min-w-[120px]"
        >
          <span>{running ? "Jeda Sesi" : "Mulai Fokus"}</span>
        </SquishyButton>
        <SquishyButton
          type="button"
          variant="butter"
          onClick={() => switchMode(mode === "focus" ? "break" : "focus")}
          className="flex-1 min-w-[120px]"
        >
          <CoffeeIcon className="w-4 h-4" />
          <span>{mode === "focus" ? "Rehat Dulu" : "Balik Fokus"}</span>
        </SquishyButton>
      </div>
    </WashiCard>
  );
}
