"use client";

import { useState } from "react";
import {
  RibbonTag,
  SquishyButton,
} from "@/components/ui/PastelPrimitives";

export interface SubmissionReviewTarget {
  id: string;
  courseTitle: string;
  repoUrl: string | null;
  demoUrl: string | null;
  studentNote: string | null;
  status: string;
  score: number | null;
  mentorFeedback: string | null;
}

const DEFAULT_CRITERIA = [
  { criterion: "Struktur & Kerapian Kode", weight: 30, maxScore: 30, score: 26, note: "" },
  { criterion: "Penanganan Edge Case & Error", weight: 25, maxScore: 25, score: 22, note: "" },
  { criterion: "Kesesuaian Fitur & UI", weight: 25, maxScore: 25, score: 23, note: "" },
  { criterion: "Kreativitas & Dokumentasi", weight: 20, maxScore: 20, score: 18, note: "" },
];

export function RubricGradingModal({
  submission,
  onClose,
  onReviewed,
}: {
  submission: SubmissionReviewTarget | null;
  onClose: () => void;
  onReviewed: (updated: SubmissionReviewTarget) => void;
}) {
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [status, setStatus] = useState<"REVIEWED" | "REVISION">("REVIEWED");
  const [feedback, setFeedback] = useState(submission?.mentorFeedback ?? "");
  const [saving, setSaving] = useState(false);

  if (!submission) return null;

  const totalScore = criteria.reduce((sum, c) => sum + Number(c.score || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submission || !feedback.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          score: Math.min(100, Math.max(0, totalScore)),
          rubricJson: criteria,
          mentorFeedback: feedback.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onReviewed({
          ...submission,
          status: data.submission.status,
          score: data.submission.score,
          mentorFeedback: data.submission.mentorFeedback,
        });
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rubrik Penilaian Tugas"
      className="fixed inset-0 z-50 bg-[#4a3e3d]/45 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fcf9f4] border-2 border-[#eadfd5] p-5 sm:p-7 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <RibbonTag color="lilac" className="mb-1">
              Formulir Evaluasi 1-on-1
            </RibbonTag>
            <h2 className="font-[family-name:var(--font-gaegu)] text-2xl sm:text-3xl font-bold">
              Rubrik Penilaian: {submission.courseTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] rounded-full bg-[#f0ede9] font-[family-name:var(--font-mali)] text-xs font-bold"
          >
            Tutup
          </button>
        </div>

        {(submission.repoUrl || submission.demoUrl || submission.studentNote) && (
          <div className="mb-4 rounded-2xl bg-white border border-[#eadfd5] p-3 space-y-1 text-sm">
            {submission.studentNote && (
              <p className="font-[family-name:var(--font-patrick-hand)] text-base">
                Catatan Siswa: {submission.studentNote}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {submission.repoUrl && (
                <a
                  href={submission.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8e4b49] underline font-bold"
                >
                  Buka GitHub Repo
                </a>
              )}
              {submission.demoUrl && (
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#645495] underline font-bold"
                >
                  Buka Demo Preview
                </a>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {criteria.map((c, idx) => (
              <div
                key={c.criterion}
                className="rounded-2xl bg-white border border-[#eadfd5] p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-[family-name:var(--font-mali)] text-xs font-bold">
                    {c.criterion}
                  </span>
                  <RibbonTag color="butter">Maks {c.maxScore}</RibbonTag>
                </div>
                <input
                  type="number"
                  min={0}
                  max={c.maxScore}
                  value={c.score}
                  onChange={(e) => {
                    const val = Math.min(c.maxScore, Math.max(0, Number(e.target.value)));
                    setCriteria((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, score: val } : item))
                    );
                  }}
                  className="w-full min-h-[40px] rounded-xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-sm font-bold"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[#FFF3B0] p-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-[family-name:var(--font-gaegu)] text-2xl font-bold">
              Total Skor: {totalScore} / 100
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "REVIEWED" | "REVISION")}
              className="min-h-[40px] rounded-full bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-xs font-bold"
            >
              <option value="REVIEWED">Status: Lulus / Dinilai</option>
              <option value="REVISION">Status: Perlu Revisi</option>
            </select>
          </div>

          <textarea
            rows={3}
            required
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tulis catatan evaluasi penyemangat untuk pacarmu..."
            className="w-full rounded-2xl bg-white border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
          />

          <div className="flex justify-end gap-2">
            <SquishyButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Mengirim..." : "Terapkan Skor & Feedback"}
            </SquishyButton>
          </div>
        </form>
      </div>
    </div>
  );
}
