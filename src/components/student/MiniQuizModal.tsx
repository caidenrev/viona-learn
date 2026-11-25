"use client";

import { useEffect, useState } from "react";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  TanyaHusbandButton,
} from "@/components/ui/PastelPrimitives";
import { CheckRibbonIcon, SparkleIcon } from "@/components/icons/CartoonIcons";
import { STICKERS } from "@/lib/stickers";

interface QuizQuestionClient {
  id: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
  orderIndex: number;
  correctOptionId?: string;
  explanation?: string | null;
}

export function MiniQuizModal({
  open,
  onClose,
  courseId,
  courseTitle,
  teacherWhatsapp,
  onPassed,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  teacherWhatsapp: string;
  onPassed: (score: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestionClient[]>([]);
  const [passingScore, setPassingScore] = useState(70);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    incorrectQuestionIds: string[];
    explanationsByQuestionId?: Record<string, string | null>;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    fetch(`/api/student/courses/${courseId}/quiz`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setQuestions(data.questions ?? []);
        setPassingScore(data.passingScore ?? 70);
      })
      .catch(() => setError("Gagal memuat soal mini quiz."))
      .finally(() => setLoading(false));
  }, [open, courseId]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/student/courses/${courseId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memeriksa jawaban.");
        return;
      }
      setResult(data);
      if (data.passed) {
        onPassed(data.score);
      }
    } catch {
      setError("Gagal mengirim jawaban quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mini Quiz Kelulusan"
      className="fixed inset-0 z-50 bg-[#4a3e3d]/45 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fcf9f4] border-2 border-[#eadfd5] p-5 sm:p-7 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <StickerImage
              src={
                result?.passed
                  ? STICKERS.passedTrophyBunny
                  : STICKERS.quizBubbleCat
              }
              alt="Maskot Quiz"
              className="w-16 h-16 shrink-0"
            />
            <div className="min-w-0">
              <RibbonTag color="lilac" className="mb-1">
                <SparkleIcon className="w-3.5 h-3.5" />
                <span>Syarat Lulus: Minimal {passingScore}%</span>
              </RibbonTag>
              <h2 className="font-[family-name:var(--font-gaegu)] text-2xl sm:text-3xl font-bold text-[#4a3e3d] break-words">
                Mini Quiz: {courseTitle}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] rounded-full bg-[#f0ede9] font-[family-name:var(--font-mali)] text-sm font-bold"
          >
            Tutup
          </button>
        </div>

        {loading ? (
          <p className="font-[family-name:var(--font-patrick-hand)] text-lg text-[#8d6e63]">
            Menyiapkan soal quiz...
          </p>
        ) : error ? (
          <div className="rounded-2xl bg-[#ffdad6] text-[#93000a] p-4 font-[family-name:var(--font-mali)] text-sm font-bold">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {questions.map((q, idx) => {
              const isWrong = result && !result.passed && result.incorrectQuestionIds.includes(q.id);
              const explanation = result?.explanationsByQuestionId?.[q.id];
              return (
                <div
                  key={q.id}
                  className={`rounded-2xl p-4 border-2 ${
                    isWrong
                      ? "bg-[#ffdad6]/40 border-[#ba1a1a]/40"
                      : "bg-white border-[#eadfd5]"
                  }`}
                >
                  <p className="font-[family-name:var(--font-mali)] text-sm sm:text-base font-bold text-[#4a3e3d] mb-3">
                    {idx + 1}. {q.prompt}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 min-h-[44px] rounded-xl px-3 py-2 border cursor-pointer transition-colors ${
                          answers[q.id] === opt.id
                            ? "bg-[#ffdad8]/50 border-[#8e4b49]"
                            : "bg-[#faf7f2] border-[#eadfd5]"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                          }
                        />
                        <span className="font-[family-name:var(--font-patrick-hand)] text-base">
                          {opt.text}
                        </span>
                      </label>
                    ))}
                  </div>
                  {isWrong && (
                    <p className="mt-2 font-[family-name:var(--font-mali)] text-xs font-bold text-[#93000a]">
                      Jawaban nomor ini masih keliru. Coba cek ulang materinya ya!
                    </p>
                  )}
                  {result?.passed && explanation && (
                    <p className="mt-2 rounded-xl bg-[#c6e9ee]/50 p-2.5 font-[family-name:var(--font-patrick-hand)] text-sm text-[#001f23]">
                      Pembahasan: {explanation}
                    </p>
                  )}
                </div>
              );
            })}

            {result && (
              <div
                className={`rounded-2xl p-4 border-2 ${
                  result.passed
                    ? "bg-[#c6e9ee]/60 border-[#436468]/40"
                    : "bg-[#FFF3B0] border-[#e2d38b]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-[family-name:var(--font-gaegu)] text-2xl font-bold text-[#4a3e3d]">
                      Skor Kamu: {result.score}%
                    </div>
                    <p className="font-[family-name:var(--font-patrick-hand)] text-base">
                      {result.passed
                        ? "Yeay lulus! Course berikutnya di roadmap sudah terbuka."
                        : "Belum mencapai batas lulus, tapi bisa kok! Coba lagi atau Tanya Husband ya."}
                    </p>
                  </div>
                  {!result.passed && (
                    <TanyaHusbandButton
                      phone={teacherWhatsapp}
                      courseTitle={courseTitle}
                      moduleTitle="Mini Quiz"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {!result?.passed ? (
                <SquishyButton type="submit" disabled={submitting}>
                  <CheckRibbonIcon className="w-4 h-4" />
                  <span>{submitting ? "Memeriksa..." : "Kirim Jawaban Quiz"}</span>
                </SquishyButton>
              ) : (
                <SquishyButton type="button" variant="mint" onClick={onClose}>
                  <span>Lanjut Beri Rating Course</span>
                </SquishyButton>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
