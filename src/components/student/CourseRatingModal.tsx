"use client";

import { useState } from "react";
import {
  RibbonTag,
  SquishyButton,
  StickerImage,
  WashiCard,
} from "@/components/ui/PastelPrimitives";
import { StarIcon } from "@/components/icons/CartoonIcons";
import { STICKERS } from "@/lib/stickers";

export function CourseRatingModal({
  courseId,
  courseTitle,
  initialStars,
  initialReview,
  onSaved,
}: {
  courseId: string;
  courseTitle: string;
  initialStars?: number;
  initialReview?: string | null;
  onSaved: (rating: { stars: number; review: string | null }) => void;
}) {
  const [stars, setStars] = useState(initialStars ?? 5);
  const [review, setReview] = useState(initialReview ?? "");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch(`/api/student/courses/${courseId}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, review }),
      });
      if (res.ok) {
        const data = await res.json();
        onSaved(data.rating);
        setSavedMsg("Rating tersimpan! Terima kasih sudah memberi ulasan.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <WashiCard
      tapeColor="yellow"
      title={`Beri Rating: ${courseTitle}`}
      badge={<RibbonTag color="mint">Course Lulus</RibbonTag>}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <StickerImage
          src={STICKERS.passedTrophyBunny}
          alt="Kelinci Piala"
          className="w-24 h-24 shrink-0"
        />
        <form onSubmit={handleSave} className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Pilih ${value} bintang`}
                onClick={() => setStars(value)}
                className="min-w-[44px] min-h-[44px] rounded-2xl bg-[#faf7f2] border border-[#eadfd5] flex items-center justify-center"
              >
                <StarIcon
                  filled={value <= stars}
                  className="w-6 h-6 text-[#8e4b49]"
                />
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Menurutmu materi ini gimana? Tulis kesan atau bagian yang paling seru..."
            className="w-full rounded-2xl bg-[#faf7f2] border border-[#eadfd5] p-3 font-[family-name:var(--font-patrick-hand)] text-base"
          />

          <div className="flex flex-wrap items-center gap-3">
            <SquishyButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Rating"}
            </SquishyButton>
            {savedMsg && (
              <span className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#436468]">
                {savedMsg}
              </span>
            )}
          </div>
        </form>
      </div>
    </WashiCard>
  );
}
