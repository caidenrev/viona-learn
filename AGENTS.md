# Viona Learn Room — Workspace Agent Rules

These rules are mandatory for every engineer and AI agent working in `d:\viona-learn-room`.

## 1. Product Scope & Anti-Hallucination Boundaries

- **Closed 2-User LMS:** This app serves exactly two accounts (`TEACHER` and `STUDENT`).
- **Do Not Invent Features:** NEVER add `/register`, public signup, email verification, OAuth/Google/Discord login, payments/billing, multi-student cohorts, PDF rapor export, ZIP export, or in-app AI chat unless explicitly added to `docs/superpowers/specs/2026-11-25-viona-learn-room-design.md`.
- **Personalization:** Adapt Stitch mock names ("Kak Sarah", "Budi Utomo") into the real 2-user personal context (Teacher/Mentor + Student/Girlfriend). "Tanya Mentor" routes to **"Tanya Husband"** via WhatsApp `wa.me` with pre-filled course and module context.
- **Keep Stitch Playground Client-Only:** The interactive Code Playground (`/playground`) executes HTML/CSS/JS strictly inside a sandboxed client-side `iframe` (`sandbox="allow-scripts"`). Never execute student-submitted code on the server.

## 2. Visual System ("Kawaii Stationery Planner" from Stitch)

- **Design Source of Truth:** Follow `stitch_personal_pastel_lms_platform/kawaii_stationery_planner/DESIGN.md` and the Stitch screen layouts.
- **Color Tokens:**
  - Canvas / Paper: `#fcf9f4` (`surface`), `#FAF7F2` (`milk-ivory`), `#ffffff` (`surface-container-lowest`), `#f6f3ee` (`surface-container-low`)
  - Text Ink: `#4A3E3D` (`cocoa-ink`), `#534342` (`on-surface-variant`), `#8D6E63` (`soft-latte`)
  - Accents: `#FFAAA6` (`sakura-pink`), `#8E4B49` (`sakura-deep`), `#C8B6FF` (`pastel-lilac`), `#645495` (`lilac-deep`), `#FFF3B0` (`butter-yellow`), `#C6E9EE` (`mint/tertiary-fixed`), `#EADFD5` (`sticker-stroke`)
- **Typography:** Load Google Fonts `Gaegu` (display/headings), `Mali` (labels/buttons/chips), and `Patrick Hand` (body/notes), plus monospace for code blocks.
- **Stationery Tactile Craft:** Use die-cut sticker borders (`2px` dashed/solid `#EADFD5` + `#FFFFFF` halo), rotated translucent washi-tape strips (`-2deg` to `2deg`), lined butter-yellow memo pads, and squishy 3D tactile buttons (`border-bottom: 3px` compressing on `:active`).

## 3. Strict Zero-Emoji Rule

- **No OS/Unicode Emojis Anywhere:** Unicode emojis (`\p{Extended_Pictographic}`, including stars, hearts, flames, books, checkmarks inside Stitch HTML such as `⭐` or `✓` when emoji-like) are strictly forbidden in `src/` and `prisma/`.
- **Approved Visuals Only:** Use custom inline cartoon SVG components (`src/components/icons/CartoonIcons.tsx`) or PNG sticker assets under `public/stickers/` (generated via Nano Banana / `image-generator` and sliced from the user's sticker sheets + `hirono.png`).
- **Automated Gate:** `tests/no-emoji.test.ts` MUST pass on every change.

## 4. Mobile-First Responsive Rules

- **Never Hide Navigation on Mobile:** The Stitch HTML hides `<nav class="hidden md:flex">` on `<768px`. In React, ALWAYS provide a mobile bottom navigation bar or slide-over drawer so every primary route (`Dashboard`, `Materi`, `Catatan & Tugas`, `Playground`, `Statistik`, plus `Konsol Mentor` for Teacher) is reachable on phones.
- **Prevent Stitch Pill/Text Overlap:** Ensure cards and pills use `min-w-0`, `flex-wrap`, and flexible heights (never fixed heights that clip `"Lanjut Belajar"` or KPI counters).
- **Breakpoint Collapsing:**
  - Desktop (`>= 1024px`): 12-column grids, 3-column Lesson Reader, side-by-side Code Playground.
  - Tablet (`768px - 1023px`): 8-column flow, collapsible sidebars/drawers.
  - Mobile (`< 768px`): Single-column stacked stationery cards, collapsible Syllabus/Notes drawers, `min-h-[44px]` touch targets, `overflow-x-hidden` on page shells (horizontal scroll allowed only inside `<pre><code>` blocks).

## 5. Security, Data Privacy & Timezone Boundaries

- **Server Role Guards:** Every `/api/admin/*` route checks `session.role === "TEACHER"`; every `/api/student/*` route checks `session.role === "STUDENT"`.
- **No Draft Leakage:** Student endpoints MUST filter `status: "PUBLISHED"` for Roadmaps, Courses, and Modules. Teacher previews `DRAFT` modules inside `/admin/courses/[id]` Preview Mode.
- **Tamper-Proof Mini Quiz Gate:** Never return `correctOptionId` or `explanation` in `GET /api/student/courses/[id]/quiz` while `CourseProgress.status !== "PASSED"`. Verify all `PUBLISHED` modules are completed on the server before accepting `POST .../quiz/submit`.
- **Student-Private Workspace:** `WorkspaceTask` and `Note` queries MUST scope by `userId: session.userId` and MUST NEVER appear on `/admin` endpoints or screens.
- **Timezone:** All `dateKey` (`YYYY-MM-DD`) and streak computations MUST use `toJakartaDateKey()` (`Asia/Jakarta`, `UTC+7`). Never use UTC `.toISOString().slice(0, 10)`.
- **Upload Validation:** Validate uploaded images via MIME + magic bytes and `<= 5 MB` limit.

## 6. Verification Gate

Before marking any task or sprint done, run after the final edit:
1. `npx tsc --noEmit`
2. `npm test` (including `tests/no-emoji.test.ts`)
3. Relevant Playwright responsive (desktop + mobile viewport) E2E checks
