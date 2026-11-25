import Link from "next/link";
import type { AchievementBadge } from "@/lib/achievements";
import { RibbonTag, StickerImage, WashiCard } from "@/components/ui/PastelPrimitives";
import { SparkleIcon } from "@/components/icons/CartoonIcons";

export function AchievementBadgesCard({
  badges,
  compact = false,
}: {
  badges: AchievementBadge[];
  compact?: boolean;
}) {
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <WashiCard
      tapeColor="lilac"
      title={compact ? "Pencapaian & Lencana" : "Koleksi Lencana Hirono"}
      badge={
        <div className="flex flex-wrap items-center gap-2">
          <RibbonTag color={unlockedCount > 0 ? "pink" : "butter"}>
            <SparkleIcon className="w-3.5 h-3.5" />
            <span>
              {unlockedCount} / {badges.length} Tercapai
            </span>
          </RibbonTag>
          {compact && (
            <Link
              href="/stats#pencapaian"
              className="font-[family-name:var(--font-mali)] text-xs font-bold text-[#645495] underline"
            >
              Detail
            </Link>
          )}
        </div>
      }
      className="bg-[#fdfaff]"
    >
      <div
        id={compact ? undefined : "pencapaian"}
        className={`grid gap-3 ${
          compact
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        }`}
      >
        {badges.map((b) => (
          <div
            key={b.id}
            className={`relative flex flex-col items-center text-center rounded-2xl p-3 border-2 transition-all min-w-0 ${
              b.unlocked
                ? "bg-white border-dashed border-[#FFAAA6] shadow-xs"
                : "bg-[#f6f3ee]/80 border-dashed border-[#eadfd5]"
            }`}
          >
            <div
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center p-1.5 mb-2 ${
                b.unlocked
                  ? "bg-[#faf7f2]"
                  : "bg-[#efece6] opacity-55 grayscale"
              }`}
            >
              <StickerImage
                src={b.sticker}
                alt={b.title}
                className="w-full h-full"
              />
            </div>

            <div className="font-[family-name:var(--font-gaegu)] text-lg font-bold text-[#4a3e3d] leading-tight">
              {b.title}
            </div>
            <p className="font-[family-name:var(--font-patrick-hand)] text-xs text-[#534342] leading-snug mt-0.5 line-clamp-2">
              {b.description}
            </p>

            <span
              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 font-[family-name:var(--font-mali)] text-[10px] font-bold ${
                b.unlocked
                  ? "bg-[#C6E9EE] text-[#2b4c50]"
                  : "bg-[#eadfd5]/70 text-[#8d6e63]"
              }`}
            >
              {b.unlocked ? `Tercapai (${b.progressLabel})` : b.progressLabel}
            </span>
          </div>
        ))}
      </div>
    </WashiCard>
  );
}
