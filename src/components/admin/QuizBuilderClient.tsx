"use client";

import { useState } from "react";
import {
  RibbonTag,
  SquishyButton,
  WashiCard,
} from "@/components/ui/PastelPrimitives";

export interface QuizBuilderQuestion {
  prompt: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation: string;
}

export function QuizBuilderClient({
  courseId,
  initialPassingScore,
  initialQuestions,
}: {
  courseId: string;
  initialPassingScore: number;
  initialQuestions: QuizBuilderQuestion[];
}) {
  const [passingScore, setPassingScore] = useState(initialPassingScore);
  const [questions, setQuestions] = useState<QuizBuilderQuestion[]>(
    initialQuestions.length > 0
      ? initialQuestions
      : [
          {
            prompt: "",
            options: [
              { id: "a", text: "" },
              { id: "b", text: "" },
              { id: "c", text: "" },
            ],
            correctOptionId: "a",
            explanation: "",
          },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        prompt: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
        ],
        correctOptionId: "a",
        explanation: "",
      },
    ]);
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveQuiz(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const cleaned = questions
        .filter((q) => q.prompt.trim().length > 0)
        .map((q) => ({
          prompt: q.prompt.trim(),
          options: q.options.filter((o) => o.text.trim().length > 0),
          correctOptionId: q.correctOptionId,
          explanation: q.explanation.trim() || null,
        }));

      const res = await fetch(`/api/admin/courses/${courseId}/quiz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passingScore, questions: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Gagal menyimpan quiz.");
        return;
      }
      setMessage("Mini Quiz berhasil disimpan!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WashiCard
      tapeColor="mint"
      title="Mini Quiz Builder (Gerbang Kelulusan)"
      badge={<RibbonTag color="butter">Minimal {passingScore}%</RibbonTag>}
    >
      <form onSubmit={saveQuiz} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="font-[family-name:var(--font-mali)] text-xs font-bold">
            Nilai Minimum Lulus (%):
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-24 min-h-[40px] rounded-xl bg-[#faf7f2] border border-[#eadfd5] px-3 font-[family-name:var(--font-mali)] text-sm font-bold"
          />
        </div>

        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="rounded-2xl bg-[#faf7f2] p-4 border border-[#eadfd5] space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#645495]">
                  Pertanyaan #{qIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#93000a]"
                >
                  Hapus Soal
                </button>
              </div>

              <input
                type="text"
                value={q.prompt}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((item, i) =>
                      i === qIdx ? { ...item, prompt: e.target.value } : item
                    )
                  )
                }
                placeholder="Tulis pertanyaan mini quiz..."
                className="w-full min-h-[44px] rounded-xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-base"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div key={opt.id} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={q.correctOptionId === opt.id}
                      onChange={() =>
                        setQuestions((prev) =>
                          prev.map((item, i) =>
                            i === qIdx ? { ...item, correctOptionId: opt.id } : item
                          )
                        )
                      }
                      aria-label={`Jawaban benar ${opt.id}`}
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item, i) =>
                            i === qIdx
                              ? {
                                  ...item,
                                  options: item.options.map((o, j) =>
                                    j === oIdx ? { ...o, text: e.target.value } : o
                                  ),
                                }
                              : item
                          )
                        )
                      }
                      placeholder={`Opsi ${opt.id.toUpperCase()}`}
                      className="flex-1 min-w-0 min-h-[40px] rounded-xl bg-white border border-[#eadfd5] px-2.5 font-[family-name:var(--font-patrick-hand)] text-base"
                    />
                  </div>
                ))}
              </div>

              <input
                type="text"
                value={q.explanation}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((item, i) =>
                      i === qIdx ? { ...item, explanation: e.target.value } : item
                    )
                  )
                }
                placeholder="Penjelasan (ditampilkan setelah siswa lulus)..."
                className="w-full min-h-[40px] rounded-xl bg-white border border-[#eadfd5] px-3 font-[family-name:var(--font-patrick-hand)] text-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SquishyButton type="button" variant="outline" onClick={addQuestion}>
            + Tambah Soal
          </SquishyButton>
          <SquishyButton type="submit" variant="primary" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Mini Quiz"}
          </SquishyButton>
          {message && (
            <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
              {message}
            </span>
          )}
        </div>
      </form>
    </WashiCard>
  );
}
