"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LessonRenderer } from "@/components/editor/LessonRenderer";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import {
  QuizBuilderClient,
  type QuizBuilderQuestion,
} from "@/components/admin/QuizBuilderClient";
import {
  RibbonTag,
  SquishyButton,
  WashiCard,
} from "@/components/ui/PastelPrimitives";

interface AdminModule {
  id: string;
  chapterTitle: string;
  title: string;
  orderIndex: number;
  contentJson: Record<string, unknown>;
  videoUrl: string | null;
  estimatedMinutes: number;
  status: "DRAFT" | "PUBLISHED";
}

export function CourseEditorClient({
  course,
  initialModules,
  initialQuiz,
}: {
  course: {
    id: string;
    title: string;
    summary: string;
    thumbnailUrl: string | null;
    targetDate: string | null;
    status: "DRAFT" | "PUBLISHED";
    passingScore: number;
    hasPracticeTask: boolean;
    practicePrompt: string | null;
    roadmapTitle: string;
  };
  initialModules: AdminModule[];
  initialQuiz: QuizBuilderQuestion[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false);
  const [summary, setSummary] = useState(course.summary);
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl ?? "");
  const [targetDate, setTargetDate] = useState(
    course.targetDate ? course.targetDate.slice(0, 10) : ""
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(course.status);
  const [hasPracticeTask, setHasPracticeTask] = useState(course.hasPracticeTask);
  const [practicePrompt, setPracticePrompt] = useState(course.practicePrompt ?? "");
  const [courseMsg, setCourseMsg] = useState("");

  const [modules, setModules] = useState<AdminModule[]>(initialModules);
  const [selectedModuleId, setSelectedModuleId] = useState(
    initialModules[0]?.id ?? ""
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [newModTitle, setNewModTitle] = useState("");
  const [newModChapter, setNewModChapter] = useState("Bab 1");
  const [modMsg, setModMsg] = useState("");

  const activeMod = modules.find((m) => m.id === selectedModuleId) ?? null;

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload gagal");
    return data.url as string;
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setThumbnailUrl(url);
      setCourseMsg("Thumbnail terunggah. Klik Simpan Course.");
    } catch (err) {
      setCourseMsg(err instanceof Error ? err.message : "Gagal unggah thumbnail.");
    }
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    setCourseMsg("");
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        summary,
        thumbnailUrl: thumbnailUrl || null,
        targetDate: targetDate
          ? new Date(`${targetDate}T12:00:00+07:00`).toISOString()
          : null,
        status,
        hasPracticeTask,
        practicePrompt: practicePrompt || null,
      }),
    });
    if (res.ok) {
      setCourseMsg("Perubahan course tersimpan!");
    }
  }

  async function deleteCurrentCourse() {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setCourseMsg("Gagal menghapus course.");
    }
  }

  async function createModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModTitle.trim()) return;
    const res = await fetch(`/api/admin/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterTitle: newModChapter.trim() || "Bab 1",
        title: newModTitle.trim(),
        orderIndex: modules.length + 1,
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: newModTitle.trim() }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Mulai tulis materi belajarmu di sini." }],
            },
          ],
        },
        status: "DRAFT",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setModules((prev) => [...prev, data.module]);
      setSelectedModuleId(data.module.id);
      setNewModTitle("");
    }
  }

  function updateActiveModLocal(patch: Partial<AdminModule>) {
    if (!activeMod) return;
    setModules((prev) =>
      prev.map((m) => (m.id === activeMod.id ? { ...m, ...patch } : m))
    );
  }

  async function saveActiveModule() {
    if (!activeMod) return;
    setModMsg("");
    const res = await fetch(`/api/admin/modules/${activeMod.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterTitle: activeMod.chapterTitle,
        title: activeMod.title,
        contentJson: activeMod.contentJson,
        videoUrl: activeMod.videoUrl || null,
        estimatedMinutes: activeMod.estimatedMinutes,
        status: activeMod.status,
      }),
    });
    if (res.ok) {
      setModMsg("Modul berhasil disimpan!");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/roadmaps"
            className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#8e4b49] underline"
          >
            Kembali ke Daftar Roadmap
          </Link>
          <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold mt-1">
            Studio Materi: {title}
          </h1>
        </div>
        <RibbonTag color={status === "PUBLISHED" ? "mint" : "butter"}>
          {course.roadmapTitle} - {status}
        </RibbonTag>
      </div>

      {/* Course Metadata & Thumbnail */}
      <WashiCard tapeColor="pink" title="Detail Course & Upload Thumbnail">
        <form onSubmit={saveCourse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul Course"
                className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-lg"
              />
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ringkasan course..."
                className="w-full rounded-2xl bg-[#faf7f2] border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
              />
              <div className="flex flex-wrap gap-3">
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                >
                  <option value="DRAFT">DRAFT (Tersembunyi dari Siswa)</option>
                  <option value="PUBLISHED">PUBLISHED (Terlihat Siswa)</option>
                </select>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-[#faf7f2] border-2 border-dashed border-[#eadfd5] p-4 flex flex-col items-center justify-center gap-3">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail Course"
                    className="w-full h-36 object-cover rounded-xl"
                  />
                ) : (
                  <span className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63]">
                    Belum ada thumbnail course
                  </span>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleThumbnailUpload}
                  className="font-[family-name:var(--font-mali)] text-xs"
                />
              </div>

              <label className="flex items-center gap-2 font-[family-name:var(--font-mali)] text-xs font-bold">
                <input
                  type="checkbox"
                  checked={hasPracticeTask}
                  onChange={(e) => setHasPracticeTask(e.target.checked)}
                />
                <span>Aktifkan Pengumpulan Proyek Praktek + Rubrik</span>
              </label>

              {hasPracticeTask && (
                <input
                  type="text"
                  value={practicePrompt}
                  onChange={(e) => setPracticePrompt(e.target.value)}
                  placeholder="Instruksi proyek praktek untuk siswa..."
                  className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SquishyButton type="submit" variant="primary">
              Simpan Detail Course
            </SquishyButton>
            {confirmDeleteCourse ? (
              <div className="inline-flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={deleteCurrentCourse}
                  className="min-h-[44px] px-4 rounded-full bg-[#ba1a1a] text-white font-[family-name:var(--font-mali)] text-xs font-bold cursor-pointer"
                >
                  Yakin Hapus Course Ini?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteCourse(false)}
                  className="min-h-[44px] px-4 rounded-full bg-[#f0ede9] font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d] cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteCourse(true)}
                className="min-h-[44px] px-4 rounded-full bg-[#ffdad6] hover:bg-[#ffc6bf] font-[family-name:var(--font-mali)] text-xs font-bold text-[#93000a] cursor-pointer"
              >
                Hapus Course
              </button>
            )}
            {courseMsg && (
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
                {courseMsg}
              </span>
            )}
          </div>
        </form>
      </WashiCard>

      {/* Hypertext Editor + Module List + Preview Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <WashiCard tapeColor="yellow" title="Daftar Modul" className="lg:col-span-4">
          <ul className="space-y-2 mb-4">
            {modules.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedModuleId(m.id)}
                  className={`w-full min-h-[44px] rounded-2xl px-3 py-2 text-left flex items-center justify-between gap-2 border ${
                    m.id === activeMod?.id
                      ? "bg-[#ffdad8] border-[#8e4b49]"
                      : "bg-[#faf7f2] border-[#eadfd5]"
                  }`}
                >
                  <span className="font-[family-name:var(--font-patrick-hand)] text-base truncate">
                    {m.title}
                  </span>
                  <RibbonTag color={m.status === "PUBLISHED" ? "mint" : "butter"}>
                    {m.status}
                  </RibbonTag>
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={createModule} className="space-y-2 pt-3 border-t border-dashed border-[#eadfd5]">
            <input
              type="text"
              value={newModChapter}
              onChange={(e) => setNewModChapter(e.target.value)}
              placeholder="Nama Bab (mis. Bab 1)"
              className="w-full min-h-[40px] rounded-xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs"
            />
            <input
              type="text"
              value={newModTitle}
              onChange={(e) => setNewModTitle(e.target.value)}
              placeholder="Judul modul baru..."
              className="w-full min-h-[44px] rounded-xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
            />
            <SquishyButton type="submit" variant="butter" className="w-full">
              + Tambah Modul
            </SquishyButton>
          </form>
        </WashiCard>

        <WashiCard
          tapeColor="lilac"
          title={activeMod ? `Editor Modul: ${activeMod.title}` : "Pilih atau Tambah Modul"}
          className="lg:col-span-8"
          badge={
            activeMod && (
              <button
                type="button"
                onClick={() => setPreviewMode((p) => !p)}
                className="min-h-[36px] px-3.5 rounded-full bg-[#C8B6FF] text-[#200d4e] font-[family-name:var(--font-mali)] text-xs font-bold"
              >
                {previewMode ? "Kembali ke Editor" : "Preview Siswa"}
              </button>
            )
          }
        >
          {activeMod ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={activeMod.title}
                  onChange={(e) => updateActiveModLocal({ title: e.target.value })}
                  placeholder="Judul Modul"
                  className="sm:col-span-2 min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <select
                  value={activeMod.status}
                  onChange={(e) =>
                    updateActiveModLocal({
                      status: e.target.value as "DRAFT" | "PUBLISHED",
                    })
                  }
                  className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>

              {previewMode ? (
                <div className="rounded-2xl bg-[#faf7f2] p-5 border-2 border-dashed border-[#eadfd5]">
                  <RibbonTag color="butter" className="mb-3">
                    Mode Preview Siswa ({activeMod.status})
                  </RibbonTag>
                  <LessonRenderer contentJson={activeMod.contentJson} />
                </div>
              ) : (
                <RichTextEditor
                  key={activeMod.id}
                  initialContent={activeMod.contentJson}
                  onChange={(doc) => updateActiveModLocal({ contentJson: doc })}
                  onUploadImage={uploadImage}
                />
              )}

              <div className="flex flex-wrap items-center gap-3">
                <SquishyButton
                  type="button"
                  variant="primary"
                  onClick={saveActiveModule}
                >
                  Simpan Modul
                </SquishyButton>
                {modMsg && (
                  <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
                    {modMsg}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#8d6e63]">
              Tambahkan modul di panel sebelah kiri untuk mulai menulis materi.
            </p>
          )}
        </WashiCard>
      </div>

      <QuizBuilderClient
        courseId={course.id}
        initialPassingScore={course.passingScore}
        initialQuestions={initialQuiz}
      />
    </div>
  );
}
