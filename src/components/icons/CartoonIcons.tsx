import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function BookStackIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="4" width="16" height="4.5" rx="1.5" fill="#FFAAA6" />
      <rect x="4" y="10" width="16" height="4.5" rx="1.5" fill="#C8B6FF" />
      <rect x="4" y="16" width="16" height="4" rx="1.5" fill="#C6E9EE" />
    </svg>
  );
}

export function FlameIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#FFAAA6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.5c2 3.8 5.5 6.2 5.5 10.5a5.5 5.5 0 1 1-11 0c0-2.3 1.1-4.3 2.7-6 .2 1.8 1.3 2.8 2.3 2.8-.1-2.5-.3-4.8.5-7.3z" />
    </svg>
  );
}

export function CalendarIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="3" fill="#FFF3B0" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function LockIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="11" width="14" height="10" rx="3" fill="#EBE8E3" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function StarIcon({
  filled = false,
  className = "w-5 h-5",
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "#FFF3B0" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polygon points="12,3 14.9,8.8 21.3,9.7 16.6,14.2 17.7,20.6 12,17.6 6.3,20.6 7.4,14.2 2.7,9.7 9.1,8.8" />
    </svg>
  );
}

export function ChatBubbleIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#C6E9EE"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L4 20l1-4.2A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}

export function CheckRibbonIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" fill="#C6E9EE" />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
    </svg>
  );
}

export function PencilIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 4.5l5 5L8 21H3v-5L14.5 4.5z" fill="#FFF3B0" />
    </svg>
  );
}

export function CoffeeIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 10h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5z" fill="#FFDAD8" />
      <path d="M16 11h2a2.5 2.5 0 0 1 0 5h-2M7 6c0-1 .8-1.5.8-2.5M11 6c0-1 .8-1.5.8-2.5" />
    </svg>
  );
}

export function SparkleIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#FFF3B0"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3l2.1 5.9L20 11l-5.9 2.1L12 19l-2.1-5.9L4 11l5.9-2.1L12 3z" />
    </svg>
  );
}

export function CodeIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />
    </svg>
  );
}

export function ChartIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="13" width="4" height="7" rx="1" fill="#C8B6FF" />
      <rect x="10" y="9" width="4" height="11" rx="1" fill="#FFAAA6" />
      <rect x="16" y="5" width="4" height="15" rx="1" fill="#FFF3B0" />
    </svg>
  );
}

export function SettingsIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="3" fill="#E8DDFF" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
