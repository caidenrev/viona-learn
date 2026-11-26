"use client";

import { useState } from "react";
import {
  CheckRibbonIcon,
  PencilIcon,
  SparkleIcon,
} from "@/components/icons/CartoonIcons";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { STICKERS } from "@/lib/stickers";

interface TaskRow {
  id: string;
  title: string;
  completed: boolean;
  category: "STUDY" | "PERSONAL";
  dueDate: string | null;
}

interface NoteRow {
  id: string;
  title: string;
  body: string;
  tags: string[];
  color: "PINK" | "BUTTER" | "MINT" | "LAV";
}

interface SubmissionRow {
  id: string;
  courseTitle: string;
  status: string;
  score: number | null;
  repoUrl: string | null;
  demoUrl: string | null;
  mentorFeedback: string | null;
}

const NOTE_BG = {
  PINK: "bg-[#fff2f1]",
  BUTTER: "bg-[#FFF3B0]/70",
  MINT: "bg-[#c6e9ee]/50",
  LAV: "bg-[#e8ddff]/60",
} as const;

export function NotesTasksClient({
  initialTasks,
  initialNotes,
  submissions,
}: {
  initialTasks: TaskRow[];
  initialNotes: NoteRow[];
  submissions: SubmissionRow[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [notes, setNotes] = useState(initialNotes);
  const [tab, setTab] = useState<"ALL" | "TASKS" | "NOTES" | "SUBMISSIONS">("ALL");
  const [search, setSearch] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState<"STUDY" | "PERSONAL">("STUDY");
  const [taskDue, setTaskDue] = useState("");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [noteColor, setNoteColor] = useState<"PINK" | "BUTTER" | "MINT" | "LAV">("BUTTER");

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const res = await fetch("/api/student/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle.trim(),
        category: taskCategory,
        dueDate: taskDue ? new Date(`${taskDue}T12:00:00+07:00`).toISOString() : null,
        isTodayGoal: true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => [data.task, ...prev]);
      setTaskTitle("");
      setTaskDue("");
    }
  }

  async function toggleTask(t: TaskRow) {
    const next = !t.completed;
    setTasks((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, completed: next } : x))
    );
    await fetch(`/api/student/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: next }),
    });
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((x) => x.id !== id));
    await fetch(`/api/student/tasks/${id}`, { method: "DELETE" });
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) return;
    const parsedTags = noteTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/student/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: noteTitle.trim(),
        body: noteBody.trim(),
        tags: parsedTags,
        color: noteColor,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setNoteTitle("");
      setNoteBody("");
      setNoteTags("");
    }
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/student/notes/${id}`, { method: "DELETE" });
  }

  const filteredNotes = notes.filter((n) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <WashiCard tapeColor="pink">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="min-w-0">
            <RibbonTag color="pink" className="mb-2">
              <SparkleIcon className="w-3.5 h-3.5" />
              <span>BUKU JURNAL SISWA</span>
            </RibbonTag>
            <h1 className="font-[family-name:var(--font-gaegu)] text-3xl sm:text-4xl font-bold text-[#4a3e3d]">
              Catatan &amp; Tugas Belajar
            </h1>
            <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#534342]">
              Ruang arsip catatan harian, daftar target tugas, dan hasil review tugas praktek.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StickerImage
              src={STICKERS.sheet.bunnyPencil}
              alt="Kelinci Pensil"
              className="w-16 h-16"
            />
            <StickerImage
              src={STICKERS.notesBearMemo}
              alt="Beruang Catatan"
              className="w-24 h-24"
            />
          </div>
        </div>
      </WashiCard>

      {/* 3 Responsive KPI Washi Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <WashiCard tapeColor="pink">
          <div className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
            Tugas Selesai
          </div>
          <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold text-[#4a3e3d] mt-1">
            {completedTasksCount} / {tasks.length}
          </div>
        </WashiCard>
        <WashiCard tapeColor="yellow">
          <div className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
            Koleksi Catatan
          </div>
          <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold text-[#4a3e3d] mt-1">
            {notes.length} Lembar
          </div>
        </WashiCard>
        <WashiCard tapeColor="lilac">
          <div className="font-[family-name:var(--font-mali)] text-xs font-bold uppercase text-[#8d6e63]">
            Proyek Praktek
          </div>
          <div className="font-[family-name:var(--font-gaegu)] text-3xl font-bold text-[#4a3e3d] mt-1">
            {submissions.length} Kiriman
          </div>
        </WashiCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "ALL", label: "Semua" },
            { id: "TASKS", label: "To-Do Belajar" },
            { id: "NOTES", label: "Catatan Pribadi" },
            { id: "SUBMISSIONS", label: "Proyek Praktek" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[44px] px-4 py-2 rounded-full font-[family-name:var(--font-mali)] text-xs font-bold border transition-colors ${
              tab === item.id
                ? "bg-[#8e4b49] text-white border-[#8e4b49]"
                : "bg-white text-[#534342] border-[#eadfd5]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {(tab === "ALL" || tab === "TASKS" || tab === "SUBMISSIONS") && (
          <div className="lg:col-span-6 space-y-6 min-w-0">
            {(tab === "ALL" || tab === "TASKS") && (
              <WashiCard
                tapeColor="mint"
                title="Daftar Target & To-Do"
                badge={
                  <div className="flex items-center gap-1.5">
                    <StickerImage
                      src={STICKERS.sheet.todoCircleLilac}
                      alt="Target Lilac"
                      className="w-8 h-8"
                    />
                    <StickerImage
                      src={STICKERS.sheet.todoBear}
                      alt="Beruang To-Do"
                      className="w-9 h-9"
                    />
                  </div>
                }
              >
                <form onSubmit={addTask} className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Tulis tugas baru..."
                    className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 py-2 font-[family-name:var(--font-patrick-hand)] text-base"
                  />
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={taskCategory}
                      onChange={(e) =>
                        setTaskCategory(e.target.value as "STUDY" | "PERSONAL")
                      }
                      className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                    >
                      <option value="STUDY">Kategori: Belajar</option>
                      <option value="PERSONAL">Kategori: Pribadi</option>
                    </select>
                    <input
                      type="date"
                      value={taskDue}
                      onChange={(e) => setTaskDue(e.target.value)}
                      className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs"
                    />
                    <SquishyButton type="submit" variant="primary">
                      Tambah Tugas
                    </SquishyButton>
                  </div>
                </form>

                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 rounded-2xl bg-[#faf7f2] px-3 py-2 border border-[#eadfd5]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(t)}
                        className="flex items-center gap-3 min-w-0 flex-1 min-h-[44px] text-left"
                      >
                        <span
                          className={`w-5 h-5 rounded-md border-2 border-[#4a3e3d] flex items-center justify-center shrink-0 ${
                            t.completed ? "bg-[#FFAAA6]" : "bg-white"
                          }`}
                        >
                          {t.completed && <CheckRibbonIcon className="w-4 h-4" />}
                        </span>
                        <span
                          className={`font-[family-name:var(--font-patrick-hand)] text-base break-words ${
                            t.completed ? "line-through text-[#8d6e63]" : ""
                          }`}
                        >
                          {t.title}
                        </span>
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        <RibbonTag color={t.category === "STUDY" ? "pink" : "lilac"}>
                          {t.category === "STUDY" ? "Belajar" : "Pribadi"}
                        </RibbonTag>
                        <button
                          type="button"
                          onClick={() => deleteTask(t.id)}
                          className="min-h-[36px] px-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] font-[family-name:var(--font-mali)] text-xs font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </WashiCard>
            )}

            {(tab === "ALL" || tab === "SUBMISSIONS") && submissions.length > 0 && (
              <WashiCard
                tapeColor="lilac"
                title="Status Tugas Praktek"
                badge={
                  <StickerImage
                    src={STICKERS.sheet.backpackPink}
                    alt="Tas Belajar"
                    className="w-9 h-9"
                  />
                }
              >
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-2xl bg-[#faf7f2] p-4 border border-[#eadfd5]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <strong className="font-[family-name:var(--font-gaegu)] text-xl">
                          {sub.courseTitle}
                        </strong>
                        <RibbonTag color={sub.status === "REVIEWED" ? "mint" : "butter"}>
                          {sub.status === "REVIEWED"
                            ? `Dinilai: ${sub.score ?? "-"}/100`
                            : sub.status === "REVISION"
                              ? "Perlu Revisi"
                              : "Menunggu Review"}
                        </RibbonTag>
                      </div>
                      {sub.mentorFeedback && (
                        <p className="mt-2 rounded-xl bg-[#FFF3B0] p-3 font-[family-name:var(--font-patrick-hand)] text-base">
                          Evaluasi Mentor: {sub.mentorFeedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </WashiCard>
            )}
          </div>
        )}

        {(tab === "ALL" || tab === "NOTES") && (
          <div className="lg:col-span-6 space-y-6 min-w-0">
            <WashiCard
              tapeColor="yellow"
              title="Koleksi Catatan Belajarku"
              badge={
                <div className="flex items-center gap-1.5">
                  <StickerImage
                    src={STICKERS.sheet.bowBlue}
                    alt="Pita Biru"
                    className="w-7 h-7"
                  />
                  <PencilIcon className="w-5 h-5" />
                </div>
              }
            >
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul, isi, atau tag catatan..."
                className="w-full min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-4 py-2 font-[family-name:var(--font-patrick-hand)] text-base mb-4"
              />

              <form onSubmit={addNote} className="space-y-2.5 mb-5 p-3 rounded-2xl bg-[#f6f3ee] border border-[#eadfd5]">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Judul catatan baru..."
                  className="w-full min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <textarea
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Isi catatan atau ringkasan materi..."
                  className="w-full rounded-2xl bg-white border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="Tag dipisah koma (mis. React, CSS)"
                    className="flex-1 min-w-[160px] min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-sm"
                  />
                  <select
                    value={noteColor}
                    onChange={(e) =>
                      setNoteColor(e.target.value as "PINK" | "BUTTER" | "MINT" | "LAV")
                    }
                    className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                  >
                    <option value="BUTTER">Kertas Kuning</option>
                    <option value="PINK">Kertas Sakura</option>
                    <option value="MINT">Kertas Mint</option>
                    <option value="LAV">Kertas Lilac</option>
                  </select>
                  <SquishyButton type="submit" variant="butter">
                    Simpan Catatan
                  </SquishyButton>
                </div>
              </form>

              <div className="space-y-3">
                {filteredNotes.map((n) => (
                  <article
                    key={n.id}
                    className={`rounded-2xl p-4 border border-[#eadfd5] ${NOTE_BG[n.color]}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-[family-name:var(--font-gaegu)] text-2xl font-bold text-[#4a3e3d] break-words">
                        {n.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => deleteNote(n.id)}
                        className="min-h-[36px] px-2.5 rounded-xl bg-white/80 text-[#93000a] font-[family-name:var(--font-mali)] text-xs font-bold shrink-0"
                      >
                        Hapus
                      </button>
                    </div>
                    <p className="font-[family-name:var(--font-patrick-hand)] text-base whitespace-pre-wrap break-words">
                      {n.body}
                    </p>
                    {n.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {n.tags.map((tag) => (
                          <RibbonTag key={tag} color="lilac">
                            #{tag}
                          </RibbonTag>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </WashiCard>
          </div>
        )}
      </div>
    </div>
  );
}
