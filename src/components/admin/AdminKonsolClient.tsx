"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookStackIcon,
  FlameIcon,
  PencilIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/icons/CartoonIcons";
import {
  RubricGradingModal,
  type SubmissionReviewTarget,
} from "@/components/admin/RubricGradingModal";
import {
  AdminCourseManager,
  type AdminCourseListItem,
  type AdminRoadmapOption,
} from "@/components/admin/AdminCourseManager";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { STICKERS } from "@/lib/stickers";

interface MentorNoteItem {
  id: string;
  title: string;
  body: string;
}

export function AdminKonsolClient({
  studentName,
  streakDays,
  passedCourseCount,
  totalCourseCount,
  initialRoadmaps,
  initialCourses,
  initialSubmissions,
  ratings,
  quizAttempts,
  initialMentorNotes,
}: {
  studentName: string;
  streakDays: number;
  passedCourseCount: number;
  totalCourseCount: number;
  initialRoadmaps: AdminRoadmapOption[];
  initialCourses: AdminCourseListItem[];
  initialSubmissions: SubmissionReviewTarget[];
  ratings: Array<{
    id: string;
    courseTitle: string;
    stars: number;
    review: string | null;
  }>;
  quizAttempts: Array<{
    id: string;
    courseTitle: string;
    score: number;
    passed: boolean;
  }>;
  initialMentorNotes: MentorNoteItem[];
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [activeSubmission, setActiveSubmission] =
    useState<SubmissionReviewTarget | null>(null);
  const [mentorNotes, setMentorNotes] = useState(initialMentorNotes);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const publishedCourseCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const displayTotalCourseCount =
    courses.length > 0 ? publishedCourseCount : totalCourseCount;

  async function addMentorNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) return;
    const res = await fetch("/api/admin/private-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: noteTitle.trim(), body: noteBody.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setMentorNotes((prev) => [data.note, ...prev]);
      setNoteTitle("");
      setNoteBody("");
    }
  }

  async function deleteMentorNote(id: string) {
    setMentorNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/admin/private-notes?id=${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-6">
      <WashiCard tapeColor="pink">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <RibbonTag color="lilac">
              <SparkleIcon className="w-3.5 h-3.5" />
              <span>PORTAL EVALUASI &amp; KURIKULUM</span>
            </RibbonTag>
            <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold">
              Konsol Guru &amp; Pembimbing
            </h1>
            <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
              Kelola roadmap belajar, buat modul materi di hypertext editor, dan pantau progres {studentName}.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/admin/roadmaps"
                className="squishy-btn inline-flex items-center gap-2 rounded-full bg-[#FFAAA6] text-[#4a3e3d] px-4 py-2 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold"
              >
                <BookStackIcon className="w-4 h-4" />
                <span>Kelola Roadmap &amp; Course</span>
              </Link>
              <Link
                href="/admin/settings"
                className="squishy-btn inline-flex items-center gap-2 rounded-full bg-[#C8B6FF] text-[#4a3e3d] px-4 py-2 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold"
              >
                <span>Setelan WhatsApp &amp; Akun</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
          <StickerImage
            src={STICKERS.mentorBearDesk}
            alt="Mentor Bear"
            className="w-28 h-28 shrink-0"
          />
        </div>
      </WashiCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <WashiCard tapeColor="pink">
          <div className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
            Submission Perlu Review
          </div>
          <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold mt-1">
            {pendingCount} Tugas Masuk
          </div>
        </WashiCard>

        <WashiCard tapeColor="mint">
          <div className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
            Kelulusan Course Siswa
          </div>
          <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold mt-1">
            {passedCourseCount} / {displayTotalCourseCount} Course
          </div>
        </WashiCard>

        <WashiCard tapeColor="yellow">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
              Streak Aktif {studentName}
            </span>
            <FlameIcon className="w-5 h-5 text-[#8e4b49]" />
          </div>
          <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold mt-1">
            {streakDays} Hari
          </div>
        </WashiCard>
      </div>

      <AdminCourseManager
        roadmaps={initialRoadmaps}
        courses={courses}
        onCoursesChange={setCourses}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <WashiCard
            tapeColor="lilac"
            title="Antrean Submission Praktek"
            badge={
              <StickerImage
                src={STICKERS.sheet.bearDesk}
                alt="Beruang Meja Belajar"
                className="w-10 h-10"
              />
            }
          >
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl bg-[#faf7f2] p-4 border border-[#eadfd5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <strong className="font-[family-name:var(--font-gaegu)] text-xl">
                        {sub.courseTitle}
                      </strong>
                      <RibbonTag color={sub.status === "REVIEWED" ? "mint" : "butter"}>
                        {sub.status === "REVIEWED"
                          ? `Skor ${sub.score ?? "-"}`
                          : sub.status === "REVISION"
                            ? "Revisi"
                            : "Perlu Direview"}
                      </RibbonTag>
                    </div>
                    {sub.studentNote && (
                      <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342]">
                        {sub.studentNote}
                      </p>
                    )}
                  </div>
                  <SquishyButton
                    type="button"
                    variant="primary"
                    onClick={() => setActiveSubmission(sub)}
                  >
                    Buka Rubrik Nilai
                  </SquishyButton>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63]">
                  Belum ada tugas praktek yang dikirim siswa.
                </p>
              )}
            </div>
          </WashiCard>

          <WashiCard tapeColor="mint" title="Hasil Mini Quiz & Rating Course">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#534342] mb-2">
                  Percobaan Quiz Terbaru
                </h3>
                <ul className="space-y-2">
                  {quizAttempts.slice(0, 5).map((q) => (
                    <li
                      key={q.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#faf7f2] px-3 py-2 text-sm"
                    >
                      <span className="truncate">{q.courseTitle}</span>
                      <RibbonTag color={q.passed ? "mint" : "pink"}>
                        {q.score}%
                      </RibbonTag>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#534342] mb-2">
                  Rating dari {studentName}
                </h3>
                <ul className="space-y-2">
                  {ratings.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl bg-[#faf7f2] p-2.5 border border-[#eadfd5]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-[family-name:var(--font-mali)] text-xs font-bold truncate">
                          {r.courseTitle}
                        </span>
                        <span className="inline-flex items-center gap-1 font-[family-name:var(--font-mali)] text-xs font-bold text-[#8e4b49]">
                          <StarIcon filled className="w-3.5 h-3.5" />
                          {r.stars}
                        </span>
                      </div>
                      {r.review && (
                        <p className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#534342] mt-1">
                          {r.review}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </WashiCard>
        </div>

        <WashiCard
          tapeColor="yellow"
          title="Catatan Pribadi Mentor"
          badge={<RibbonTag color="lilac">Privat Teacher</RibbonTag>}
          className="lg:col-span-5"
        >
          <form onSubmit={addMentorNote} className="space-y-2.5 mb-4">
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Judul catatan evaluasi..."
              className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
            />
            <textarea
              rows={2}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Rencana materi berikutnya atau catatan bimbingan..."
              className="w-full rounded-2xl bg-[#faf7f2] border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
            />
            <SquishyButton type="submit" variant="butter" className="w-full">
              <PencilIcon className="w-4 h-4" />
              <span>Simpan Catatan Rahasia Guru</span>
            </SquishyButton>
          </form>

          <ul className="space-y-2.5">
            {mentorNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl bg-[#fff2f1] p-3 border border-[#eadfd5]"
              >
                <div className="flex items-start justify-between gap-2">
                  <strong className="font-[family-name:var(--font-mali)] text-xs font-bold">
                    {n.title}
                  </strong>
                  <button
                    type="button"
                    onClick={() => deleteMentorNote(n.id)}
                    className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#93000a]"
                  >
                    Hapus
                  </button>
                </div>
                <p className="font-[family-name:var(--font-patrick-hand)] text-base mt-1">
                  {n.body}
                </p>
              </li>
            ))}
          </ul>
        </WashiCard>
      </div>

      <RubricGradingModal
        submission={activeSubmission}
        onClose={() => setActiveSubmission(null)}
        onReviewed={(updated) =>
          setSubmissions((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          )
        }
      />
    </div>
  );
}
