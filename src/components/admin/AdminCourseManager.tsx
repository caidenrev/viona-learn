"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  BookStackIcon,
  PencilIcon,
} from "@/components/icons/CartoonIcons";
import {
  RibbonTag,
  SquishyButton,
  WashiCard,
} from "@/components/ui/PastelPrimitives";

export interface AdminCourseListItem {
  id: string;
  roadmapId: string;
  roadmapTitle: string;
  title: string;
  slug: string;
  summary: string;
  status: "DRAFT" | "PUBLISHED";
  orderIndex: number;
  passingScore: number;
  targetDate: string | null;
  moduleCount: number;
  quizCount: number;
}

export interface AdminRoadmapOption {
  id: string;
  title: string;
}

export function AdminCourseManager({
  roadmaps,
  courses,
  onCoursesChange,
}: {
  roadmaps: AdminRoadmapOption[];
  courses: AdminCourseListItem[];
  onCoursesChange: (next: AdminCourseListItem[]) => void;
}) {
  const [filterRoadmapId, setFilterRoadmapId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newRoadmapId, setNewRoadmapId] = useState(roadmaps[0]?.id ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newStatus, setNewStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [newPassingScore, setNewPassingScore] = useState(70);
  const [newTargetDate, setNewTargetDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoadmapId, setEditRoadmapId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editStatus, setEditStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [editPassingScore, setEditPassingScore] = useState(70);
  const [editTargetDate, setEditTargetDate] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredCourses = courses.filter((c) => {
    if (filterRoadmapId !== "ALL" && c.roadmapId !== filterRoadmapId) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.roadmapTitle.toLowerCase().includes(q)
    );
  });

  function startEdit(c: AdminCourseListItem) {
    setEditingId(c.id);
    setEditRoadmapId(c.roadmapId);
    setEditTitle(c.title);
    setEditSummary(c.summary);
    setEditStatus(c.status);
    setEditPassingScore(c.passingScore);
    setEditTargetDate(c.targetDate ? c.targetDate.slice(0, 10) : "");
    setConfirmDeleteId(null);
    setFeedback("");
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    const roadmapId = newRoadmapId || roadmaps[0]?.id;
    if (!roadmapId || !newTitle.trim() || !newSummary.trim()) return;
    setBusyId("create");
    setFeedback("");
    try {
      const siblingCount = courses.filter((c) => c.roadmapId === roadmapId).length;
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId,
          title: newTitle.trim(),
          summary: newSummary.trim(),
          status: newStatus,
          passingScore: Number(newPassingScore) || 70,
          targetDate: newTargetDate
            ? new Date(`${newTargetDate}T12:00:00+07:00`).toISOString()
            : null,
          orderIndex: siblingCount + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error ?? "Gagal menambah course.");
        return;
      }
      const created: AdminCourseListItem = {
        id: data.course.id,
        roadmapId: data.course.roadmapId,
        roadmapTitle:
          data.course.roadmap?.title ??
          roadmaps.find((r) => r.id === roadmapId)?.title ??
          "",
        title: data.course.title,
        slug: data.course.slug,
        summary: data.course.summary,
        status: data.course.status,
        orderIndex: data.course.orderIndex,
        passingScore: data.course.passingScore,
        targetDate: data.course.targetDate,
        moduleCount: data.course._count?.modules ?? 0,
        quizCount: data.course._count?.quizQuestions ?? 0,
      };
      onCoursesChange([...courses, created]);
      setNewTitle("");
      setNewSummary("");
      setNewTargetDate("");
      setNewPassingScore(70);
      setNewStatus("DRAFT");
      setShowCreate(false);
      setFeedback(`Course "${created.title}" berhasil dibuat.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveEdit(courseId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || !editSummary.trim()) return;
    setBusyId(courseId);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId: editRoadmapId,
          title: editTitle.trim(),
          summary: editSummary.trim(),
          status: editStatus,
          passingScore: Math.min(100, Math.max(1, Number(editPassingScore) || 70)),
          targetDate: editTargetDate
            ? new Date(`${editTargetDate}T12:00:00+07:00`).toISOString()
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error ?? "Gagal menyimpan perubahan course.");
        return;
      }
      onCoursesChange(
        courses.map((c) =>
          c.id === courseId
            ? {
                ...c,
                roadmapId: data.course.roadmapId,
                roadmapTitle: data.course.roadmap?.title ?? c.roadmapTitle,
                title: data.course.title,
                summary: data.course.summary,
                status: data.course.status,
                passingScore: data.course.passingScore,
                targetDate: data.course.targetDate,
              }
            : c
        )
      );
      setEditingId(null);
      setFeedback(`Course "${data.course.title}" diperbarui.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleStatus(c: AdminCourseListItem) {
    const next = c.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusyId(c.id);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/courses/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setFeedback("Gagal mengubah status course.");
        return;
      }
      onCoursesChange(
        courses.map((item) =>
          item.id === c.id ? { ...item, status: next } : item
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteCourse(courseId: string) {
    setBusyId(courseId);
    setFeedback("");
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setFeedback("Gagal menghapus course.");
        return;
      }
      const deleted = courses.find((c) => c.id === courseId);
      onCoursesChange(courses.filter((c) => c.id !== courseId));
      setConfirmDeleteId(null);
      if (editingId === courseId) setEditingId(null);
      setFeedback(
        deleted ? `Course "${deleted.title}" berhasil dihapus.` : "Course dihapus."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <WashiCard
      tapeColor="mint"
      title="Kelola Courses"
      badge={
        <div className="flex flex-wrap items-center gap-2">
          <RibbonTag color="butter">{courses.length} Total Course</RibbonTag>
          <SquishyButton
            type="button"
            variant="primary"
            onClick={() => {
              setShowCreate((v) => !v);
              setFeedback("");
            }}
            className="px-3.5 py-2 text-xs"
          >
            <span>{showCreate ? "Tutup Form" : "+ Tambah Course"}</span>
          </SquishyButton>
        </div>
      }
    >
      {feedback && (
        <div className="mb-3 rounded-2xl bg-[#c6e9ee]/50 border border-[#84bcc4] px-3.5 py-2 font-[family-name:var(--font-mali)] text-xs font-bold text-[#2b4c50]">
          {feedback}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreateCourse}
          className="mb-4 rounded-2xl bg-[#f6f3ee] p-4 border-2 border-dashed border-[#eadfd5] space-y-3"
        >
          <div className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d]">
            Buat Course Baru
          </div>
          {roadmaps.length === 0 ? (
            <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8e4b49]">
              Belum ada Roadmap. Buat Roadmap dulu di menu{" "}
              <Link href="/admin/roadmaps" className="underline font-bold">
                Roadmap &amp; Course
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <select
                  aria-label="Pilih Roadmap"
                  value={newRoadmapId}
                  onChange={(e) => setNewRoadmapId(e.target.value)}
                  className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                >
                  {roadmaps.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Judul Course"
                  className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <select
                  aria-label="Status Course Baru"
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    aria-label="Skor Lulus Quiz"
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(Number(e.target.value))}
                    title="Minimal skor lulus (%)"
                    className="w-24 min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                  />
                  <input
                    type="date"
                    aria-label="Target Tanggal"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="flex-1 min-w-0 min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-2.5 font-[family-name:var(--font-mali)] text-xs"
                  />
                </div>
              </div>
              <textarea
                rows={2}
                required
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Ringkasan materi course..."
                className="w-full rounded-2xl bg-white border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
              />
              <div className="flex flex-wrap gap-2">
                <SquishyButton
                  type="submit"
                  variant="butter"
                  disabled={busyId === "create"}
                >
                  <BookStackIcon className="w-4 h-4" />
                  <span>{busyId === "create" ? "Menyimpan..." : "Simpan Course Baru"}</span>
                </SquishyButton>
              </div>
            </>
          )}
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau ringkasan course..."
          className="flex-1 min-w-0 min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3.5 font-[family-name:var(--font-patrick-hand)] text-base"
        />
        <select
          aria-label="Filter Roadmap"
          value={filterRoadmapId}
          onChange={(e) => setFilterRoadmapId(e.target.value)}
          className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
        >
          <option value="ALL">Semua Roadmap</option>
          {roadmaps.map((rm) => (
            <option key={rm.id} value={rm.id}>
              {rm.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredCourses.map((c) => {
          const isEditing = editingId === c.id;
          const isConfirmingDelete = confirmDeleteId === c.id;
          const isBusy = busyId === c.id;

          return (
            <div
              key={c.id}
              className="rounded-2xl bg-[#faf7f2] p-4 border border-[#eadfd5] space-y-3"
            >
              {isEditing ? (
                <form
                  onSubmit={(e) => handleSaveEdit(c.id, e)}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <select
                      aria-label="Roadmap Course"
                      value={editRoadmapId}
                      onChange={(e) => setEditRoadmapId(e.target.value)}
                      className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                    >
                      {roadmaps.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      aria-label="Edit Judul Course"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                    />
                    <select
                      aria-label="Edit Status Course"
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as "DRAFT" | "PUBLISHED")
                      }
                      className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        aria-label="Edit Skor Lulus"
                        value={editPassingScore}
                        onChange={(e) =>
                          setEditPassingScore(Number(e.target.value))
                        }
                        className="w-24 min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                      />
                      <input
                        type="date"
                        aria-label="Edit Target Tanggal"
                        value={editTargetDate}
                        onChange={(e) => setEditTargetDate(e.target.value)}
                        className="flex-1 min-w-0 min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-2.5 font-[family-name:var(--font-mali)] text-xs"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    required
                    aria-label="Edit Ringkasan Course"
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full rounded-2xl bg-white border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
                  />
                  <div className="flex flex-wrap gap-2">
                    <SquishyButton type="submit" variant="primary" disabled={isBusy}>
                      <span>{isBusy ? "Menyimpan..." : "Simpan Perubahan"}</span>
                    </SquishyButton>
                    <SquishyButton
                      type="button"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      <span>Batal</span>
                    </SquishyButton>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="font-[family-name:var(--font-gaegu)] text-2xl font-bold text-[#4a3e3d] break-words">
                        {c.title}
                      </strong>
                      <RibbonTag color={c.status === "PUBLISHED" ? "mint" : "butter"}>
                        {c.status}
                      </RibbonTag>
                      <RibbonTag color="lilac">{c.roadmapTitle}</RibbonTag>
                    </div>
                    <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342] break-words">
                      {c.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-mali)] text-[11px] font-bold text-[#8d6e63]">
                      <span>{c.moduleCount} Modul</span>
                      <span>{c.quizCount} Soal Quiz</span>
                      <span>Lulus Min {c.passingScore}%</span>
                      {c.targetDate && (
                        <span>Target {c.targetDate.slice(0, 10)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleStatus(c)}
                      className="min-h-[40px] px-3 rounded-full bg-[#f0ede9] hover:bg-[#e5e2dd] font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d] cursor-pointer"
                    >
                      {c.status === "PUBLISHED" ? "Jadikan Draft" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="min-h-[40px] px-3 rounded-full bg-[#FFF3B0] hover:bg-[#ffec8c] border border-[#e2d38b] inline-flex items-center gap-1.5 font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d] cursor-pointer"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {isConfirmingDelete ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteCourse(c.id)}
                          className="min-h-[40px] px-3 rounded-full bg-[#ba1a1a] text-white font-[family-name:var(--font-mali)] text-xs font-bold cursor-pointer"
                        >
                          {isBusy ? "Menghapus..." : "Yakin Hapus?"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[40px] px-3 rounded-full bg-white border border-[#eadfd5] font-[family-name:var(--font-mali)] text-xs font-bold text-[#534342] cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(c.id)}
                        className="min-h-[40px] px-3 rounded-full bg-[#ffdad6] hover:bg-[#ffc6bf] font-[family-name:var(--font-mali)] text-xs font-bold text-[#93000a] cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                    <Link
                      href={`/admin/courses/${c.id}`}
                      className="squishy-btn inline-flex items-center gap-1.5 rounded-full bg-[#C8B6FF] text-[#200d4e] px-3.5 py-2 min-h-[40px] font-[family-name:var(--font-mali)] text-xs font-bold"
                    >
                      <span>Studio Materi</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredCourses.length === 0 && (
          <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#8d6e63]">
            Tidak ada course yang cocok dengan filter saat ini.
          </p>
        )}
      </div>
    </WashiCard>
  );
}
