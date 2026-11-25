"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  BookStackIcon,
} from "@/components/icons/CartoonIcons";
import {
  RibbonTag,
  SquishyButton,
  WashiCard,
} from "@/components/ui/PastelPrimitives";

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
  courses: CourseItem[];
}

export function RoadmapManagerClient({
  initialRoadmaps,
}: {
  initialRoadmaps: RoadmapItem[];
}) {
  const [roadmaps, setRoadmaps] = useState(initialRoadmaps);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [levelLabel, setLevelLabel] = useState("Dasar - Mahir");
  const [targetDate, setTargetDate] = useState("");

  const [courseDrafts, setCourseDrafts] = useState<
    Record<string, { title: string; summary: string }>
  >({});

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

  return (
    <div className="space-y-6">
      <WashiCard tapeColor="pink" title="Buat Roadmap Baru">
        <form onSubmit={createRoadmap} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Roadmap (mis. AI App Builder)"
              className="min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
            />
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
                  <RibbonTag color={rm.status === "PUBLISHED" ? "mint" : "butter"}>
                    {rm.status}
                  </RibbonTag>
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
                    className="rounded-2xl bg-[#faf7f2] p-3.5 border border-[#eadfd5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="font-[family-name:var(--font-gaegu)] text-xl">
                          {course.title}
                        </strong>
                        <RibbonTag
                          color={course.status === "PUBLISHED" ? "mint" : "butter"}
                        >
                          {course.status}
                        </RibbonTag>
                      </div>
                      <p className="font-[family-name:var(--font-patrick-hand)] text-sm text-[#534342]">
                        {course.summary}
                      </p>
                    </div>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="squishy-btn inline-flex items-center gap-1.5 rounded-full bg-[#C8B6FF] text-[#200d4e] px-4 py-2 min-h-[44px] font-[family-name:var(--font-mali)] text-xs font-bold shrink-0"
                    >
                      <span>Buka Studio Materi &amp; Quiz</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
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
