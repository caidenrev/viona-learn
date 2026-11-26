"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  BookStackIcon,
  CheckRibbonIcon,
  LockIcon,
  SparkleIcon,
} from "@/components/icons/CartoonIcons";
import { LessonRenderer } from "@/components/editor/LessonRenderer";
import { CourseRatingModal } from "@/components/student/CourseRatingModal";
import { MiniQuizModal } from "@/components/student/MiniQuizModal";
import { PomodoroWidget } from "@/components/student/PomodoroWidget";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  TanyaHusbandButton,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { STICKERS } from "@/lib/stickers";

interface ReaderModule {
  id: string;
  chapterTitle: string;
  title: string;
  orderIndex: number;
  contentJson: unknown;
  videoUrl: string | null;
  estimatedMinutes: number;
}

export function CourseReaderClient({
  course,
  modules,
  initialCompletedIds,
  initialRating,
  initialSubmission,
  teacherWhatsapp,
  hasQuiz,
}: {
  course: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    passingScore: number;
    hasPracticeTask: boolean;
    practicePrompt: string | null;
    effectiveStatus: "LOCKED" | "UNLOCKED" | "PASSED";
    bestScore: number;
    roadmap: { title: string; slug: string };
  };
  modules: ReaderModule[];
  initialCompletedIds: string[];
  initialRating: { stars: number; review: string | null } | null;
  initialSubmission: {
    repoUrl: string | null;
    demoUrl: string | null;
    studentNote: string | null;
    status: string;
    score: number | null;
    mentorFeedback: string | null;
  } | null;
  teacherWhatsapp: string;
  hasQuiz: boolean;
}) {
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id ?? "");
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [syllabusOpenMobile, setSyllabusOpenMobile] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [passed, setPassed] = useState(course.effectiveStatus === "PASSED");
  const [rating, setRating] = useState(initialRating);
  const [noteBody, setNoteBody] = useState("");
  const [noteSaved, setNoteSaved] = useState("");

  const [repoUrl, setRepoUrl] = useState(initialSubmission?.repoUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(initialSubmission?.demoUrl ?? "");
  const [studentNote, setStudentNote] = useState(
    initialSubmission?.studentNote ?? ""
  );
  const [subSaved, setSubSaved] = useState("");

  const activeIdx = Math.max(
    0,
    modules.findIndex((m) => m.id === activeModuleId)
  );
  const activeModule = modules[activeIdx] ?? null;

  const completedSet = new Set(completedIds);
  const allModulesCompleted =
    modules.length > 0 && modules.every((m) => completedSet.has(m.id));
  const progressPct =
    modules.length > 0
      ? Math.round((completedIds.length / modules.length) * 100)
      : 0;

  async function toggleModuleComplete(moduleId: string) {
    const next = !completedSet.has(moduleId);
    setCompletedIds((prev) =>
      next ? [...new Set([...prev, moduleId])] : prev.filter((id) => id !== moduleId)
    );
    await fetch(`/api/student/modules/${moduleId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: next }),
    });
  }

  async function saveQuickNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    const res = await fetch("/api/student/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: activeModule?.title ?? course.title,
        body: noteBody.trim(),
        courseId: course.id,
        color: "BUTTER",
      }),
    });
    if (res.ok) {
      setNoteBody("");
      setNoteSaved("Catatan tersimpan di binder!");
    }
  }

  async function submitPractice(e: React.FormEvent) {
    e.preventDefault();
    setSubSaved("");
    const res = await fetch(`/api/student/courses/${course.id}/submission`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoUrl: repoUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        studentNote: studentNote.trim() || null,
      }),
    });
    if (res.ok) {
      setSubSaved("Tugas praktek terkirim ke Konsol Mentor!");
    }
  }

  const syllabusContent = (
    <WashiCard
      tapeColor="yellow"
      title="Silabus Modul"
      badge={
        <div className="flex items-center gap-1.5">
          <StickerImage
            src={STICKERS.sheet.booksRibbon}
            alt="Buku Pita"
            className="w-8 h-8"
          />
          <RibbonTag color="pink">{progressPct}%</RibbonTag>
        </div>
      }
    >
      <div className="mb-3">
        <div className="text-xs font-[family-name:var(--font-mali)] font-bold text-[#8e4b49]">
          {course.title}
        </div>
        <div className="w-full h-2.5 bg-[#ebe4dc] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-[#8D6E63] rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {modules.map((m) => {
          const isCurrent = m.id === activeModule?.id;
          const isDone = completedSet.has(m.id);
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveModuleId(m.id);
                  setSyllabusOpenMobile(false);
                }}
                className={`w-full min-h-[44px] rounded-2xl px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors ${
                  isCurrent
                    ? "bg-[#ffdad8] text-[#7a3c3a] font-bold"
                    : "bg-[#faf7f2] hover:bg-[#f0ede9] text-[#4a3e3d]"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {isDone ? (
                    <CheckRibbonIcon className="w-4 h-4 shrink-0 text-[#436468]" />
                  ) : (
                    <BookStackIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="font-[family-name:var(--font-patrick-hand)] text-base truncate">
                    {m.title}
                  </span>
                </span>
                <span className="font-[family-name:var(--font-mali)] text-[11px] text-[#8d6e63] shrink-0">
                  {m.estimatedMinutes} mnt
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </WashiCard>
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb + Mobile Syllabus Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-mali)] text-xs font-bold">
          <Link
            href="/workspace"
            className="px-3 py-1.5 rounded-full bg-[#f0ede9] text-[#534342]"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href={`/roadmaps/${course.roadmap.slug}`}
            className="px-3 py-1.5 rounded-full bg-[#f0ede9] text-[#534342]"
          >
            {course.roadmap.title}
          </Link>
          <span>/</span>
          <span className="px-3 py-1.5 rounded-full bg-[#ffdad8] text-[#7a3c3a]">
            {course.title}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSyllabusOpenMobile((o) => !o)}
          className="lg:hidden squishy-btn inline-flex items-center gap-2 rounded-full bg-[#FFF3B0] px-4 py-2 min-h-[44px] font-[family-name:var(--font-mali)] text-xs font-bold"
        >
          <BookStackIcon className="w-4 h-4" />
          <span>{syllabusOpenMobile ? "Tutup Silabus" : "Buka Silabus"}</span>
        </button>
      </div>

      {syllabusOpenMobile && <div className="lg:hidden">{syllabusContent}</div>}

      {/* Main 3-Column Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3">{syllabusContent}</aside>

        <div className="lg:col-span-6 space-y-6 min-w-0">
          {activeModule ? (
            <WashiCard
              tapeColor="pink"
              title={activeModule.title}
              badge={
                <div className="flex items-center gap-1.5">
                  <StickerImage
                    src={STICKERS.sheet.lamp}
                    alt="Lampu Belajar"
                    className="w-8 h-8"
                  />
                  <RibbonTag color="lilac">
                    {activeModule.chapterTitle} - {activeModule.estimatedMinutes} Menit
                  </RibbonTag>
                </div>
              }
            >
              {activeModule.videoUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border-2 border-[#eadfd5] bg-black/5 aspect-video">
                  <iframe
                    src={activeModule.videoUrl}
                    title={activeModule.title}
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              <LessonRenderer contentJson={activeModule.contentJson} />

              <div className="mt-6 pt-4 border-t border-dashed border-[#eadfd5] flex flex-wrap items-center justify-between gap-3">
                <SquishyButton
                  type="button"
                  variant={completedSet.has(activeModule.id) ? "mint" : "primary"}
                  onClick={() => toggleModuleComplete(activeModule.id)}
                >
                  <CheckRibbonIcon className="w-4 h-4" />
                  <span>
                    {completedSet.has(activeModule.id)
                      ? "Sudah Selesai (Klik untuk Batal)"
                      : "Tandai Modul Ini Selesai"}
                  </span>
                </SquishyButton>

                {activeIdx < modules.length - 1 && (
                  <SquishyButton
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveModuleId(modules[activeIdx + 1].id)}
                  >
                    <span>Materi Selanjutnya</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </SquishyButton>
                )}
              </div>
            </WashiCard>
          ) : (
            <WashiCard tapeColor="mint">
              <p className="font-[family-name:var(--font-patrick-hand)] text-lg">
                Belum ada modul yang dipublikasikan di course ini.
              </p>
            </WashiCard>
          )}

          {/* Optional Practice Task Submission */}
          {course.hasPracticeTask && (
            <WashiCard
              tapeColor="lilac"
              title="Mini Proyek Praktek"
              badge={
                <StickerImage
                  src={STICKERS.sheet.bearLaptop}
                  alt="Beruang Ngoding"
                  className="w-10 h-10"
                />
              }
            >
              <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342] mb-3">
                {course.practicePrompt ?? "Kirim hasil praktekmu untuk direview mentor."}
              </p>
              {initialSubmission?.mentorFeedback && (
                <div className="mb-3 rounded-2xl bg-[#FFF3B0] p-3 border border-[#e2d38b]">
                  <div className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d]">
                    Feedback Mentor (Skor: {initialSubmission.score ?? "-"} / 100):
                  </div>
                  <p className="font-[family-name:var(--font-patrick-hand)] text-base">
                    {initialSubmission.mentorFeedback}
                  </p>
                </div>
              )}
              <form onSubmit={submitPractice} className="space-y-2.5">
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="Link GitHub Repo (opsional)"
                  className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 py-2 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="Link Live Preview / Vercel (opsional)"
                  className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 py-2 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <textarea
                  rows={2}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Catatan pengiriman untuk mentor..."
                  className="w-full rounded-2xl bg-[#faf7f2] border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <SquishyButton type="submit" variant="secondary">
                    Kirim Tugas Praktek
                  </SquishyButton>
                  {subSaved && (
                    <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
                      {subSaved}
                    </span>
                  )}
                </div>
              </form>
            </WashiCard>
          )}

          {/* End-of-Course Mini Quiz Gate */}
          <WashiCard
            tapeColor="mint"
            title="Gerbang Kelulusan: Mini Quiz"
            badge={
              <RibbonTag color={passed ? "mint" : "butter"}>
                {passed ? "Sudah Lulus" : `Target ${course.passingScore}%`}
              </RibbonTag>
            }
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <StickerImage
                src={
                  passed
                    ? STICKERS.passedTrophyBunny
                    : STICKERS.quizBubbleCat
                }
                alt="Mini Quiz"
                className="w-24 h-24 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-2">
                {!hasQuiz ? (
                  <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63]">
                    Teacher belum menambahkan soal Mini Quiz untuk course ini.
                  </p>
                ) : !allModulesCompleted ? (
                  <div className="space-y-2">
                    <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342]">
                      Selesaikan seluruh modul ({completedIds.length}/{modules.length}) dulu supaya Mini Quiz-nya terbuka ya!
                    </p>
                    <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mali)] text-xs font-bold text-[#8d6e63]">
                      <LockIcon className="w-4 h-4" />
                      Mini Quiz Terkunci
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342]">
                      Semua modul selesai! Yuk kerjakan Mini Quiz untuk membuka course berikutnya.
                    </p>
                    <SquishyButton
                      type="button"
                      variant="primary"
                      onClick={() => setQuizOpen(true)}
                    >
                      <SparkleIcon className="w-4 h-4" />
                      <span>{passed ? "Lihat / Ulang Mini Quiz" : "Mulai Mini Quiz"}</span>
                    </SquishyButton>
                  </div>
                )}
              </div>
            </div>
          </WashiCard>

          {passed && (
            <CourseRatingModal
              courseId={course.id}
              courseTitle={course.title}
              initialStars={rating?.stars}
              initialReview={rating?.review}
              onSaved={(r) => setRating(r)}
            />
          )}
        </div>

        {/* Right Companion Column */}
        <aside className="lg:col-span-3 space-y-6 min-w-0">
          <PomodoroWidget />

          <WashiCard
            tapeColor="pink"
            title="Butuh Bantuan?"
            className="bg-[#f2fbfc]"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <StickerImage
                src={STICKERS.tanyaHusbandBubble}
                alt="Tanya Husband"
                className="w-24 h-24"
              />
              <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342]">
                Kalau ada bagian materi yang bikin bingung, langsung klik aja tombol di bawah ini!
              </p>
              <TanyaHusbandButton
                phone={teacherWhatsapp}
                courseTitle={course.title}
                moduleTitle={activeModule?.title ?? "Umum"}
                className="w-full"
              />
            </div>
          </WashiCard>

          <WashiCard
            tapeColor="brown"
            title="Catatan Pribadiku"
            className="lined-memo"
            badge={
              <StickerImage
                src={STICKERS.sheet.myNotesBear}
                alt="Beruang Catatan"
                className="w-9 h-9"
              />
            }
          >
            <form onSubmit={saveQuickNote} className="space-y-2">
              <textarea
                rows={3}
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Catat poin penting modul ini..."
                className="w-full rounded-2xl bg-white/85 border border-[#e2d38b] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
              />
              <SquishyButton type="submit" variant="white" className="w-full">
                Simpan Memo Modul
              </SquishyButton>
              {noteSaved && (
                <p className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
                  {noteSaved}
                </p>
              )}
            </form>
          </WashiCard>
        </aside>
      </div>

      <MiniQuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        teacherWhatsapp={teacherWhatsapp}
        onPassed={() => setPassed(true)}
      />
    </div>
  );
}
