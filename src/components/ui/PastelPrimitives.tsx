import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ChatBubbleIcon } from "@/components/icons/CartoonIcons";
import { buildTanyaHusbandUrl } from "@/lib/whatsapp";

const TAPE_COLORS = {
  pink: "bg-[#FFAAA6]/75 -rotate-2 border-y border-white/60 shadow-xs",
  lilac: "bg-[#C8B6FF]/75 rotate-1 border-y border-white/60 shadow-xs",
  yellow: "bg-[#FFF3B0]/90 rotate-2 border-y border-white/60 shadow-xs",
  mint: "bg-[#C6E9EE]/85 -rotate-1 border-y border-white/60 shadow-xs",
  brown:
    "bg-gradient-to-b from-[#b6895b]/50 via-[#9c6f44]/40 to-[#b6895b]/55 backdrop-blur-[1px] rotate-2 border border-[#7c5634]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_2px_4px_rgba(74,62,61,0.12)]",
} as const;

export function WashiCard({
  tapeColor = "pink",
  title,
  badge,
  className = "",
  children,
}: {
  tapeColor?: keyof typeof TAPE_COLORS;
  title?: string;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative sticker-card rounded-3xl p-4 sm:p-6 min-w-0 ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-3 left-8 h-5 w-24 rounded-sm ${TAPE_COLORS[tapeColor]}`}
      />
      {(title || badge) && (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 min-w-0">
          {title ? (
            <h2 className="font-[family-name:var(--font-gaegu)] text-2xl font-bold text-[#4a3e3d] leading-snug min-w-0 break-words">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {badge}
        </header>
      )}
      {children}
    </section>
  );
}

const BUTTON_VARIANTS = {
  primary:
    "bg-[#FFAAA6] hover:bg-[#ff9b96] text-[#4a3e3d] border border-[#ffdad8]",
  secondary:
    "bg-[#C8B6FF] hover:bg-[#ba9eff] text-[#4a3e3d] border border-[#e8ddff]",
  mint: "bg-[#C6E9EE] hover:bg-[#b5e1e8] text-[#001f23] border border-[#aacdd2]",
  butter:
    "bg-[#FFF3B0] hover:bg-[#ffec8c] text-[#4a3e3d] border border-[#f5e184]",
  white:
    "bg-white hover:bg-[#fcf9f4] text-[#4a3e3d] border border-[#eadfd5]",
  outline:
    "bg-white hover:bg-[#FFF3B0]/50 text-[#4a3e3d] border-2 border-dashed border-[#8D6E63]",
} as const;

export function SquishyButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
}) {
  return (
    <button
      className={`squishy-btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold leading-snug cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function RibbonTag({
  color = "pink",
  children,
  className = "",
}: {
  color?: "pink" | "lilac" | "butter" | "mint";
  children: ReactNode;
  className?: string;
}) {
  const palette = {
    pink: "bg-[#ffdad8] text-[#7a3c3a]",
    lilac: "bg-[#e8ddff] text-[#544484]",
    butter: "bg-[#FFF3B0] text-[#4a3e3d]",
    mint: "bg-[#c6e9ee] text-[#2b4c50]",
  }[color];

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1 font-[family-name:var(--font-mali)] text-xs font-bold leading-snug ${palette} ${className}`}
    >
      {children}
    </span>
  );
}

export function StickerImage({
  src,
  alt,
  className = "w-20 h-20",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain select-none drop-shadow-[0_4px_8px_rgba(141,110,99,0.14)] ${className}`}
    />
  );
}

export function TanyaHusbandButton({
  phone,
  courseTitle,
  moduleTitle,
  className = "",
}: {
  phone: string;
  courseTitle: string;
  moduleTitle: string;
  className?: string;
}) {
  const href = buildTanyaHusbandUrl({
    phone: phone || "6281234567890",
    courseTitle,
    moduleTitle,
  });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`squishy-btn inline-flex items-center justify-center gap-2 rounded-full bg-[#C6E9EE] hover:bg-[#b5e1e8] text-[#001f23] border border-[#84bcc4] px-4 py-2.5 min-h-[44px] font-[family-name:var(--font-mali)] text-sm font-bold leading-snug ${className}`}
    >
      <ChatBubbleIcon className="w-4 h-4 shrink-0" />
      <span>Tanya Husband</span>
    </a>
  );
}
