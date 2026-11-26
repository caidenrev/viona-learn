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
import {
  PLAYLIST_COLOR_OPTIONS,
  playlistColorToRibbon,
  type PlaylistNoteColor,
} from "@/lib/playlist-colors";

export interface PlaylistItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  color: PlaylistNoteColor;
  status: "DRAFT" | "PUBLISHED";
  orderIndex: number;
  _count?: { roadmaps: number };
}

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: "DRAFT" | "PUBLISHED";
  orderIndex: number;
  passingScore: number;
}

interface RoadmapItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  levelLabel: string;
  status: "DRAFT" | "PUBLISHED";
  orderIndex: number;
  playlistId?: string | null;
  playlist?: {
    id: string;
    title: string;
    slug: string;
    color: PlaylistNoteColor;
  } | null;
  courses: CourseItem[];
}

export function RoadmapManagerClient({
  initialPlaylists = [],
  initialRoadmaps,
}: {
  initialPlaylists?: PlaylistItem[];
  initialRoadmaps: RoadmapItem[];
}) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistColor, setPlaylistColor] = useState<PlaylistNoteColor>("PINK");
  const [playlistStatus, setPlaylistStatus] = useState<"DRAFT" | "PUBLISHED">(
    "PUBLISHED"
  );
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
    null
  );
  const [editPlaylistTitle, setEditPlaylistTitle] = useState("");
  const [editPlaylistDescription, setEditPlaylistDescription] = useState("");
  const [editPlaylistColor, setEditPlaylistColor] =
    useState<PlaylistNoteColor>("PINK");
  const [editPlaylistStatus, setEditPlaylistStatus] = useState<
    "DRAFT" | "PUBLISHED"
  >("PUBLISHED");
  const [confirmDeletePlaylistId, setConfirmDeletePlaylistId] = useState<
    string | null
  >(null);

  const [roadmaps, setRoadmaps] = useState(initialRoadmaps);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [levelLabel, setLevelLabel] = useState("Dasar - Mahir");
  const [targetDate, setTargetDate] = useState("");
  const [newPlaylistId, setNewPlaylistId] = useState("");

  const [courseDrafts, setCourseDrafts] = useState<
    Record<string, { title: string; summary: string }>
  >({});
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseSummary, setEditCourseSummary] = useState("");
  const [editCourseStatus, setEditCourseStatus] = useState<"DRAFT" | "PUBLISHED">(
    "DRAFT"
  );
  const [confirmDeleteCourseId, setConfirmDeleteCourseId] = useState<string | null>(
    null
  );

  async function createPlaylist(e: React.FormEvent) {
    e.preventDefault();
    if (!playlistTitle.trim()) return;
    const res = await fetch("/api/admin/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: playlistTitle.trim(),
        description: playlistDescription.trim() || null,
        color: playlistColor,
        status: playlistStatus,
        orderIndex: playlists.length + 1,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPlaylists((prev) => [...prev, data.playlist]);
      setPlaylistTitle("");
      setPlaylistDescription("");
      setPlaylistColor("PINK");
      setPlaylistStatus("PUBLISHED");
    }
  }

  function startEditPlaylist(pl: PlaylistItem) {
    setEditingPlaylistId(pl.id);
    setEditPlaylistTitle(pl.title);
    setEditPlaylistDescription(pl.description ?? "");
    setEditPlaylistColor(pl.color);
    setEditPlaylistStatus(pl.status);
    setConfirmDeletePlaylistId(null);
  }

  async function savePlaylistEdit(playlistId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!editPlaylistTitle.trim()) return;
    const res = await fetch(`/api/admin/playlists/${playlistId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editPlaylistTitle.trim(),
        description: editPlaylistDescription.trim() || null,
        color: editPlaylistColor,
        status: editPlaylistStatus,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? data.playlist : p))
      );
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.playlistId === playlistId
            ? {
                ...r,
                playlist: {
                  id: data.playlist.id,
                  title: data.playlist.title,
                  slug: data.playlist.slug,
                  color: data.playlist.color,
                },
              }
            : r
        )
      );
      setEditingPlaylistId(null);
    }
  }

  async function deletePlaylist(playlistId: string) {
    const res = await fetch(`/api/admin/playlists/${playlistId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.playlistId === playlistId
            ? { ...r, playlistId: null, playlist: null }
            : r
        )
      );
      if (newPlaylistId === playlistId) setNewPlaylistId("");
      setConfirmDeletePlaylistId(null);
      if (editingPlaylistId === playlistId) setEditingPlaylistId(null);
    }
  }

  async function assignRoadmapPlaylist(rmId: string, nextPlaylistId: string) {
    const value = nextPlaylistId || null;
    const res = await fetch(`/api/admin/roadmaps/${rmId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId: value }),
    });
    if (res.ok) {
      const data = await res.json();
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.id === rmId
            ? {
                ...r,
                playlistId: data.roadmap.playlistId ?? null,
                playlist: data.roadmap.playlist ?? null,
              }
            : r
        )
      );
    }
  }

  async function createRoadmap(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    const res = await fetch("/api/admin/roadmaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        levelLabel: levelLabel.trim() || "Dasar - Mahir",
        playlistId: newPlaylistId || null,
        targetDate: targetDate
          ? new Date(`${targetDate}T12:00:00+07:00`).toISOString()
          : null,
        status: "PUBLISHED",
        orderIndex: roadmaps.length + 1,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setRoadmaps((prev) => [...prev, { ...data.roadmap, courses: [] }]);
      setTitle("");
      setDescription("");
      setTargetDate("");
      setNewPlaylistId("");
    }
  }

  async function toggleRoadmapStatus(rm: RoadmapItem) {
    const next = rm.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/admin/roadmaps/${rm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setRoadmaps((prev) =>
        prev.map((r) => (r.id === rm.id ? { ...r, status: next } : r))
      );
    }
  }

  async function createCourse(roadmapId: string, e: React.FormEvent) {
    e.preventDefault();
    const draft = courseDrafts[roadmapId];
    if (!draft?.title?.trim() || !draft?.summary?.trim()) return;

    const targetRm = roadmaps.find((r) => r.id === roadmapId);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roadmapId,
        title: draft.title.trim(),
        summary: draft.summary.trim(),
        orderIndex: (targetRm?.courses.length ?? 0) + 1,
        status: "DRAFT",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.id === roadmapId
            ? { ...r, courses: [...r.courses, data.course] }
            : r
        )
      );
      setCourseDrafts((prev) => ({
        ...prev,
        [roadmapId]: { title: "", summary: "" },
      }));
    }
  }

  function startEditCourse(course: CourseItem) {
    setEditingCourseId(course.id);
    setEditCourseTitle(course.title);
    setEditCourseSummary(course.summary);
    setEditCourseStatus(course.status);
    setConfirmDeleteCourseId(null);
  }

  async function saveCourseEdit(roadmapId: string, courseId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!editCourseTitle.trim() || !editCourseSummary.trim()) return;
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editCourseTitle.trim(),
        summary: editCourseSummary.trim(),
        status: editCourseStatus,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.id === roadmapId
            ? {
                ...r,
                courses: r.courses.map((c) =>
                  c.id === courseId
                    ? {
                        ...c,
                        title: data.course.title,
                        summary: data.course.summary,
                        status: data.course.status,
                      }
                    : c
                ),
              }
            : r
        )
      );
      setEditingCourseId(null);
    }
  }

  async function deleteCourse(roadmapId: string, courseId: string) {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.id === roadmapId
            ? { ...r, courses: r.courses.filter((c) => c.id !== courseId) }
            : r
        )
      );
      setConfirmDeleteCourseId(null);
      if (editingCourseId === courseId) setEditingCourseId(null);
    }
  }

  return (
    <div className="space-y-6">
      <WashiCard tapeColor="yellow" title="Kelola Playlist Roadmap">
        <div className="space-y-4">
          <form onSubmit={createPlaylist} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                placeholder="Nama Playlist (mis. Jago Frontend)"
                className="sm:col-span-2 min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
              />
              <select
                value={playlistColor}
                onChange={(e) =>
                  setPlaylistColor(e.target.value as PlaylistNoteColor)
                }
                aria-label="Warna Playlist"
                className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
              >
                {PLAYLIST_COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={playlistStatus}
                onChange={(e) =>
                  setPlaylistStatus(e.target.value as "DRAFT" | "PUBLISHED")
                }
                aria-label="Status Playlist"
                className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                placeholder="Deskripsi singkat kategori playlist (opsional)"
                className="flex-1 min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
              />
              <SquishyButton type="submit" variant="butter">
                + Tambah Playlist
              </SquishyButton>
            </div>
          </form>

          {playlists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="rounded-2xl bg-[#faf7f2] p-3.5 border border-[#eadfd5] space-y-2.5"
                >
                  {editingPlaylistId === pl.id ? (
                    <form
                      onSubmit={(e) => savePlaylistEdit(pl.id, e)}
                      className="space-y-2.5"
                    >
                      <input
                        type="text"
                        required
                        value={editPlaylistTitle}
                        onChange={(e) => setEditPlaylistTitle(e.target.value)}
                        placeholder="Nama Playlist"
                        className="w-full min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editPlaylistColor}
                          onChange={(e) =>
                            setEditPlaylistColor(
                              e.target.value as PlaylistNoteColor
                            )
                          }
                          className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                        >
                          {PLAYLIST_COLOR_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editPlaylistStatus}
                          onChange={(e) =>
                            setEditPlaylistStatus(
                              e.target.value as "DRAFT" | "PUBLISHED"
                            )
                          }
                          className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                        >
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="DRAFT">DRAFT</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={editPlaylistDescription}
                        onChange={(e) =>
                          setEditPlaylistDescription(e.target.value)
                        }
                        placeholder="Deskripsi singkat playlist"
                        className="w-full min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                      />
                      <div className="flex flex-wrap gap-2">
                        <SquishyButton type="submit" variant="primary">
                          Simpan Playlist
                        </SquishyButton>
                        <SquishyButton
                          type="button"
                          variant="outline"
                          onClick={() => setEditingPlaylistId(null)}
                        >
                          Batal
                        </SquishyButton>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <RibbonTag color={playlistColorToRibbon(pl.color)}>
                            {pl.title}
                          </RibbonTag>
                          <RibbonTag
                            color={pl.status === "PUBLISHED" ? "mint" : "butter"}
                          >
                            {pl.status}
                          </RibbonTag>
                        </div>
                        {pl.description && (
                          <p className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#534342]">
                            {pl.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditPlaylist(pl)}
                          className="min-h-[38px] px-3 rounded-full bg-[#FFF3B0] border border-[#e2d38b] inline-flex items-center gap-1 font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d] cursor-pointer"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {confirmDeletePlaylistId === pl.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => deletePlaylist(pl.id)}
                              className="min-h-[38px] px-3 rounded-full bg-[#ba1a1a] text-white font-[family-name:var(--font-mali)] text-xs font-bold cursor-pointer"
                            >
                              Yakin?
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePlaylistId(null)}
                              className="min-h-[38px] px-3 rounded-full bg-white border border-[#eadfd5] font-[family-name:var(--font-mali)] text-xs font-bold text-[#534342] cursor-pointer"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePlaylistId(pl.id)}
                            className="min-h-[38px] px-3 rounded-full bg-[#ffdad6] font-[family-name:var(--font-mali)] text-xs font-bold text-[#93000a] cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </WashiCard>

      <WashiCard tapeColor="pink" title="Buat Roadmap Baru">
        <form onSubmit={createRoadmap} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Roadmap (mis. AI App Builder)"
              className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
            />
            <select
              value={newPlaylistId}
              onChange={(e) => setNewPlaylistId(e.target.value)}
              aria-label="Pilih Playlist Roadmap"
              className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
            >
              <option value="">Tanpa Playlist</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  Playlist: {pl.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={levelLabel}
              onChange={(e) => setLevelLabel(e.target.value)}
              placeholder="Label Level"
              className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
            />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs"
            />
          </div>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi tujuan roadmap..."
            className="w-full rounded-2xl bg-[#faf7f2] border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
          />
          <SquishyButton type="submit" variant="primary">
            <BookStackIcon className="w-4 h-4" />
            <span>Tambah Roadmap</span>
          </SquishyButton>
        </form>
      </WashiCard>

      <div className="space-y-6">
        {roadmaps.map((rm) => {
          const draft = courseDrafts[rm.id] ?? { title: "", summary: "" };
          return (
            <WashiCard
              key={rm.id}
              tapeColor="lilac"
              title={rm.title}
              badge={
                <div className="flex flex-wrap items-center gap-2">
                  {rm.playlist && (
                    <RibbonTag color={playlistColorToRibbon(rm.playlist.color)}>
                      {rm.playlist.title}
                    </RibbonTag>
                  )}
                  <RibbonTag color={rm.status === "PUBLISHED" ? "mint" : "butter"}>
                    {rm.status}
                  </RibbonTag>
                  <select
                    value={rm.playlistId ?? ""}
                    onChange={(e) => assignRoadmapPlaylist(rm.id, e.target.value)}
                    aria-label={`Playlist untuk ${rm.title}`}
                    className="min-h-[36px] rounded-full bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d]"
                  >
                    <option value="">Tanpa Playlist</option>
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleRoadmapStatus(rm)}
                    className="min-h-[36px] px-3 rounded-full bg-[#f0ede9] font-[family-name:var(--font-mali)] text-xs font-bold"
                  >
                    {rm.status === "PUBLISHED" ? "Jadikan Draft" : "Publish"}
                  </button>
                </div>
              }
            >
              <p className="font-[family-name:var(--font-patrick-hand)] text-base text-[#534342] mb-4">
                {rm.description}
              </p>

              <div className="space-y-2.5 mb-4">
                {rm.courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl bg-[#faf7f2] p-3.5 border border-[#eadfd5] space-y-2.5"
                  >
                    {editingCourseId === course.id ? (
                      <form
                        onSubmit={(e) => saveCourseEdit(rm.id, course.id, e)}
                        className="space-y-2.5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            required
                            value={editCourseTitle}
                            onChange={(e) => setEditCourseTitle(e.target.value)}
                            placeholder="Judul Course"
                            className="sm:col-span-2 min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                          />
                          <select
                            value={editCourseStatus}
                            onChange={(e) =>
                              setEditCourseStatus(
                                e.target.value as "DRAFT" | "PUBLISHED"
                              )
                            }
                            className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          value={editCourseSummary}
                          onChange={(e) => setEditCourseSummary(e.target.value)}
                          placeholder="Ringkasan Course"
                          className="w-full min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                        />
                        <div className="flex flex-wrap gap-2">
                          <SquishyButton type="submit" variant="primary">
                            Simpan Course
                          </SquishyButton>
                          <SquishyButton
                            type="button"
                            variant="outline"
                            onClick={() => setEditingCourseId(null)}
                          >
                            Batal
                          </SquishyButton>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="font-[family-name:var(--font-gaegu)] text-xl">
                              {course.title}
                            </strong>
                            <RibbonTag
                              color={
                                course.status === "PUBLISHED" ? "mint" : "butter"
                              }
                            >
                              {course.status}
                            </RibbonTag>
                          </div>
                          <p className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#534342]">
                            {course.summary}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditCourse(course)}
                            className="min-h-[40px] px-3 rounded-full bg-[#FFF3B0] border border-[#e2d38b] inline-flex items-center gap-1.5 font-[family-name:var(--font-mali)] text-xs font-bold text-[#4a3e3d] cursor-pointer"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          {confirmDeleteCourseId === course.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => deleteCourse(rm.id, course.id)}
                                className="min-h-[40px] px-3 rounded-full bg-[#ba1a1a] text-white font-[family-name:var(--font-mali)] text-xs font-bold cursor-pointer"
                              >
                                Yakin Hapus?
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteCourseId(null)}
                                className="min-h-[40px] px-3 rounded-full bg-white border border-[#eadfd5] font-[family-name:var(--font-mali)] text-xs font-bold text-[#534342] cursor-pointer"
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCourseId(course.id)}
                              className="min-h-[40px] px-3 rounded-full bg-[#ffdad6] font-[family-name:var(--font-mali)] text-xs font-bold text-[#93000a] cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="squishy-btn inline-flex items-center gap-1.5 rounded-full bg-[#C8B6FF] text-[#200d4e] px-4 py-2 min-h-[40px] font-[family-name:var(--font-mali)] text-xs font-bold shrink-0"
                          >
                            <span>Buka Studio Materi &amp; Quiz</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => createCourse(rm.id, e)}
                className="rounded-2xl bg-[#f6f3ee] p-3.5 border border-[#eadfd5] space-y-2.5"
              >
                <div className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#534342]">
                  Tambah Course Baru ke {rm.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) =>
                      setCourseDrafts((prev) => ({
                        ...prev,
                        [rm.id]: { ...draft, title: e.target.value },
                      }))
                    }
                    placeholder="Judul Course"
                    className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                  />
                  <input
                    type="text"
                    value={draft.summary}
                    onChange={(e) =>
                      setCourseDrafts((prev) => ({
                        ...prev,
                        [rm.id]: { ...draft, summary: e.target.value },
                      }))
                    }
                    placeholder="Ringkasan singkat course"
                    className="min-h-[44px] rounded-2xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
                  />
                </div>
                <SquishyButton type="submit" variant="butter">
                  + Tambah Course
                </SquishyButton>
              </form>
            </WashiCard>
          );
        })}
      </div>
    </div>
  );
}
