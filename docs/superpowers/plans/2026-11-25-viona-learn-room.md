# Viona Learn Room (Belajar Yuk!) — Sprint & Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Also obey all workspace rules in [AGENTS.md](file:///d:/viona-learn-room/AGENTS.md).

**Goal:** Build Viona Learn Room ("Belajar Yuk!"), a mobile-responsive, 2-user (Teacher + Student) Next.js fullstack personal LMS and daily study planner matching the Google Stitch **Kawaii Stationery Planner** UI (`stitch_personal_pastel_lms_platform/`) with custom cartoon SVGs, `hirono.png`, Nano Banana PNG stickers, Tiptap hypertext authoring, server-graded Mini Quiz gates, course ratings, optional practice submission rubrics, contextual "Tanya Husband" WhatsApp integration, and `Asia/Jakarta` daily streaks.

**Architecture:** Unified Next.js 15 App Router + TypeScript fullstack application backed by PostgreSQL + Prisma ORM, HTTP-only `jose` JWT session cookies (`TEACHER` / `STUDENT`), Tiptap rich-text editor with shared read-only renderer, swappable image storage (`public/uploads/` in dev), client-side sandboxed HTML/CSS/JS playground (`iframe`), and responsive Tailwind v4 stationery UI (`Gaegu` / `Mali` / `Patrick Hand`).

**Tech Stack:** Next.js 15 (App Router, TypeScript), React 19, Tailwind CSS v4, Prisma + PostgreSQL, `jose`, `bcryptjs`, `zod`, Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-code-block-lowlight`, `lowlight`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-youtube`), Vitest, Playwright.

**Spec & Rules:** [2026-11-25-viona-learn-room-design.md](file:///d:/viona-learn-room/docs/superpowers/specs/2026-11-25-viona-learn-room-design.md) | [AGENTS.md](file:///d:/viona-learn-room/AGENTS.md) | [DESIGN.md](file:///d:/viona-learn-room/stitch_personal_pastel_lms_platform/kawaii_stationery_planner/DESIGN.md)

## Global Constraints

- **Closed 2-Account System:** Only `TEACHER` and `STUDENT` roles exist; `/register` never exists; seed provisions credentials from env vars without overwriting live passwords.
- **Zero-Emoji Rule:** Unicode emojis (`\p{Extended_Pictographic}`) are strictly forbidden across `src/` and `prisma/` (including removing emojis like `⭐` from Stitch HTML); verified by `tests/no-emoji.test.ts`.
- **Mobile-First Responsive Shell:** Never hide navigation on mobile without a bottom-bar or drawer; all buttons/pills use `min-w-0`, `flex-wrap`, and `min-h-[44px]` touch targets; zero horizontal page overflow at `390x844`.
- **Role & Privacy Isolation:** `/api/admin/*` and `/admin/*` require `TEACHER`; `/api/student/*` and `/workspace|/learn|/notes|/playground|/stats` require `STUDENT`; `WorkspaceTask` & Student `Note` are scoped to `userId` and excluded from `/admin`; `MentorPrivateNote` is excluded from `/api/student/*`.
- **Quiz Security & No Draft Leakage:** Student endpoints filter `status: "PUBLISHED"`; `GET .../quiz` omits `correctOptionId` and `explanation` until `CourseProgress.status === "PASSED"`; grading and unlock logic run on the server.
- **Timezone:** All `dateKey` (`YYYY-MM-DD`) computations use `toJakartaDateKey()` (`Asia/Jakarta`, `UTC+7`).
- **WhatsApp Format:** `"Sayangg, ini gimana ya di bagian {CourseTitle} - {ModuleTitle}?"` encoded to `https://wa.me/{digits}?text=...`.
- **Anti-Hallucination Scope:** Do NOT build Discord/GitHub OAuth, Vercel webhook, PDF rapor export, ZIP export, payments, or AI chat.

## Review Focus

1. **Empty or Zero-Question Quiz:** Submitting a quiz when a course has 0 questions must return `400` instead of dividing by zero (`NaN`) or auto-passing.
2. **Jakarta Midnight Rollover:** `2026-11-25T17:05:00Z` (`00:05 WIB` Nov 26) and `2026-11-25T16:55:00Z` (`23:55 WIB` Nov 25) resolve to `"2026-11-26"` and `"2026-11-25"`.
3. **Course Reorder & Late Module Publish:** Publishing a new module inside an already-`PASSED` course must not revoke `CourseProgress.status === "PASSED"` or re-lock downstream courses; `DRAFT` items stay hidden from students.
4. **Idempotent Streak & Safe Uncheck:** Unchecking a completed module or `STUDY` task keeps today's `DailyActivityLog` intact, and toggling off/on repeatedly never double-counts `activityCount`.
5. **Upload Validation & Mobile Overflow:** Spoofed non-image upload bytes or `> 5 MB` files return `400`; Playwright mobile viewport (`390x844`) asserts `document.documentElement.scrollWidth <= window.innerWidth` across all primary pages.

---

## Sprint Structure & File Map

- **Sprint 1 (Tasks 1–3): Foundation, Assets, DB & Auth**
  - `package.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`
  - `public/stickers/*.png` (`hirono.png`, Nano Banana generated `welcome-bunny-reading.png`, `pomodoro-focus-cat.png`, `streak-sparkle-star.png`, `quiz-bubble-cat.png`, `passed-trophy-bunny.png`, `tanya-husband-bubble.png`, `notes-bear-memo.png`, `playground-bear-laptop.png`, `mentor-bear-desk.png`, plus transparent `public/stickers/sheet/*.png`)
  - `src/lib/emoji-guard.ts`, `tests/no-emoji.test.ts`
  - `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/prisma.ts`, `src/lib/date.ts`
  - `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/*`
- **Sprint 2 (Tasks 4–6): Core Domain Engines & Fullstack APIs**
  - `src/lib/whatsapp.ts`, `src/lib/storage.ts`, `src/lib/progression.ts`, `src/lib/streak.ts`
  - `src/app/api/admin/*` (settings, upload, roadmaps, courses, modules, quiz, submissions, private-notes, overview)
  - `src/app/api/student/*` (workspace, roadmaps, courses, modules/toggle, quiz, rating, submission, calendar, tasks, notes, stats, profile)
- **Sprint 3 (Tasks 7–9): Stitch Kawaii Stationery UI, Responsive Shell & Student Screens**
  - `src/app/layout.tsx` (Google Fonts `Gaegu`, `Mali`, `Patrick Hand`), `src/app/globals.css` (Stitch color & stationery CSS)
  - `src/components/icons/CartoonIcons.tsx`, `src/components/ui/PastelPrimitives.tsx`, `src/components/layout/AppShell.tsx` (responsive desktop header + mobile bottom bar)
  - `src/components/editor/CalloutExtension.ts`, `src/components/editor/RichTextEditor.tsx`, `src/components/editor/LessonRenderer.tsx`
  - Student pages: `/login`, `/workspace`, `/learn/[courseSlug]` (Reader + Pomodoro + Catatan + Tanya Husband + Mini Quiz + Rating), `/notes`, `/playground`, `/stats`, `/settings`
- **Sprint 4 (Tasks 10–11): Teacher Konsol Studio & Responsive E2E Verification**
  - Teacher pages: `/admin`, `/admin/roadmaps`, `/admin/courses/[id]`, `/admin/settings` (Authoring Studio, Preview Mode, Quiz Builder, Submission Rubric Modal, Mentor Private Notes)
  - `tests/e2e/lms-flow.spec.ts` (Desktop `1280x800` + Mobile `390x844` full lifecycle)

---

## Sprint 1: Foundation, Sticker Pipeline, DB & Auth

### Task 1: Project Scaffold, Sticker Assets, and Zero-Emoji Guard

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.gitignore`, `.env.example`
- Create: `scripts/slice-stickers.mjs` (or `.py`), `public/stickers/*.png` (already staged: `hirono.png`, `quiz-bubble-cat.png`, `passed-trophy-bunny.png`, `tanya-husband-bubble.png`, `playground-bear-laptop.png`)
- Create: `src/lib/emoji-guard.ts`
- Test: `tests/no-emoji.test.ts`

**Interfaces:**
- Produces: `findEmojiViolations(text: string): string[]`, `scanDirectoryForEmojis(dirs: string[]): string[]`

- [ ] **Step 1: Initialize Next.js 15 TypeScript project & install dependencies**

Create `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` cleanly in the existing workspace (preserving `docs/`, `AGENTS.md`, `public/stickers/`, and `stitch_personal_pastel_lms_platform/`).
Install:
`npm install next@^15 react@^19 react-dom@^19 @prisma/client jose bcryptjs zod @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-code-block-lowlight lowlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-youtube`
`npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss eslint eslint-config-next prisma vitest @vitejs/plugin-react @testing-library/react @playwright/test tsx`

- [ ] **Step 2: Configure `.gitignore`, `.env.example`, and `vitest.config.ts`**

Ignore `node_modules/`, `.next/`, `.superpowers/`, `public/uploads/`, `.env`. Add `.env.example` with `DATABASE_URL`, `AUTH_SECRET`, `SEED_TEACHER_USERNAME`, `SEED_TEACHER_PASSWORD`, `SEED_STUDENT_USERNAME`, `SEED_STUDENT_PASSWORD`, `SEED_TEACHER_WHATSAPP`.

- [ ] **Step 3: Verify 40 transparent PNG stickers in `public/stickers/`**

Confirm all 40 transparent PNGs exist in `public/stickers/` (`hirono.png`, 9 Nano Banana generated stickers: `welcome-bunny-reading.png`, `pomodoro-focus-cat.png`, `streak-sparkle-star.png`, `quiz-bubble-cat.png`, `passed-trophy-bunny.png`, `tanya-husband-bubble.png`, `notes-bear-memo.png`, `playground-bear-laptop.png`, `mentor-bear-desk.png`, plus 30 `sheet-*.png` cutouts). Create `src/lib/stickers.ts` exporting a typed `STICKERS` registry mapping semantic UI slots to `/stickers/*.png` paths.

- [ ] **Step 4: Write failing `tests/no-emoji.test.ts` -> verify fail -> implement `src/lib/emoji-guard.ts` -> verify pass**

Assert `findEmojiViolations('hello ⭐')` returns violation, `findEmojiViolations('BELAJAR YUK! 100%')` returns `[]`, and `scanDirectoryForEmojis(['src', 'prisma'])` returns `[]`.

- [ ] **Step 5: Commit**

Commit: `chore: scaffold nextjs app, sticker assets, and zero-emoji guard`

### Task 2: Prisma Schema, Jakarta Date Utilities, and Idempotent Seed

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/prisma.ts`, `src/lib/date.ts`
- Test: `tests/date.test.ts`

**Interfaces:**
- Produces: `prisma`, `toJakartaDateKey(date?: Date): string`, `getJakartaTodayKey(): string`, `shiftDateKey(dateKey: string, deltaDays: number): string`, `getMonthRange(monthKey: string): { start: Date; end: Date; startKey: string; endKey: string }`, `seedDatabase(prisma: PrismaClient, env: SeedEnv): Promise<void>`

- [ ] **Step 1: Write failing `tests/date.test.ts` for UTC+7 rollover (`16:55Z` vs `17:05Z`) and month bounds -> verify fail**
- [ ] **Step 2: Implement `src/lib/date.ts`, `prisma/schema.prisma` (all 16 models & 7 enums from Spec Section 6), `src/lib/prisma.ts`, and `prisma/seed.ts` (idempotent user creation + starter `PUBLISHED` roadmap, zero emojis)**
- [ ] **Step 3: Run `npx prisma generate && npx vitest run tests/date.test.ts tests/no-emoji.test.ts` -> verify pass**
- [ ] **Step 4: Commit**

Commit: `feat: add prisma schema, jakarta date helpers, and idempotent seed`

### Task 3: Authentication, Session Cookies, Password Management, and Role Middleware

**Files:**
- Create: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/me/route.ts`, `src/app/api/auth/password/route.ts`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: `prisma`
- Produces: `SessionPayload`, `AuthError`, `hashPassword`, `verifyPassword`, `signSessionToken`, `verifySessionToken`, `getSessionUser`, `requireRole`

- [ ] **Step 1: Write failing `tests/auth.test.ts` (bcrypt, JWT round-trip, tampered token, role guard 401/403) -> verify fail**
- [ ] **Step 2: Implement `src/lib/auth.ts`, auth routes, and `src/middleware.ts` protecting `/admin/*` (`TEACHER`), student workspace routes (`STUDENT`), and `/settings` (authenticated)**
- [ ] **Step 3: Run `npx vitest run tests/auth.test.ts` -> verify pass**
- [ ] **Step 4: Commit**

Commit: `feat: implement 2-role session auth, password updates, and route middleware`

---

## Sprint 2: Core Domain Engines & Fullstack APIs

### Task 4: Domain Engines (Quiz Gate Progression, Daily Streak, WhatsApp URL, Image Upload)

**Files:**
- Create: `src/lib/whatsapp.ts`, `src/lib/storage.ts`, `src/lib/progression.ts`, `src/lib/streak.ts`
- Test: `tests/whatsapp.test.ts`, `tests/storage.test.ts`, `tests/progression.test.ts`, `tests/streak.test.ts`

**Interfaces:**
- Consumes: `toJakartaDateKey`, `shiftDateKey`
- Produces: `buildTanyaHusbandUrl`, `validateImageBuffer`, `saveUploadedImage`, `computeRoadmapCourseStates`, `gradeQuizSubmission`, `calculateCurrentStreak`, `recordStudyActivity`

- [ ] **Step 1: Write failing tests covering all 4 helpers and Review Focus edge cases (0-question quiz, spoofed image magic bytes, >5 MB file, streak continuity, late module publish not re-locking downstream courses) -> verify fail**
- [ ] **Step 2: Implement `whatsapp.ts`, `storage.ts`, `progression.ts`, and `streak.ts` (idempotent `DailyActivityLog` transaction)**
- [ ] **Step 3: Run tests -> verify pass**
- [ ] **Step 4: Commit**

Commit: `feat: add quiz grading, roadmap progression, streak, whatsapp, and upload engines`

### Task 5: Teacher Admin APIs (Studio, Submissions Rubric, Private Notes, Settings, Overview)

**Files:**
- Create: `src/app/api/admin/settings/route.ts`, `src/app/api/admin/upload/route.ts`, `src/app/api/admin/roadmaps/route.ts`, `src/app/api/admin/roadmaps/[id]/route.ts`, `src/app/api/admin/courses/route.ts`, `src/app/api/admin/courses/[id]/route.ts`, `src/app/api/admin/courses/[id]/modules/route.ts`, `src/app/api/admin/modules/[id]/route.ts`, `src/app/api/admin/courses/[id]/quiz/route.ts`, `src/app/api/admin/submissions/[id]/review/route.ts`, `src/app/api/admin/private-notes/route.ts`, `src/app/api/admin/overview/route.ts`
- Test: `tests/api-admin.test.ts`

**Interfaces:**
- Consumes: `requireRole('TEACHER')`, `saveUploadedImage`, `prisma`, `zod`

- [ ] **Step 1: Write failing `tests/api-admin.test.ts` (`403` for `STUDENT`, `400` on spoofed upload, CRUD roadmap/course/module/quiz, submission rubric scoring, overview excludes student `WorkspaceTask` & `Note`) -> verify fail**
- [ ] **Step 2: Implement all `/api/admin/*` route handlers with Zod validation**
- [ ] **Step 3: Run tests -> verify pass**
- [ ] **Step 4: Commit**

Commit: `feat: implement teacher admin api endpoints`

### Task 6: Student APIs (Workspace, Reader, Quiz Gate, Rating, Submission, Calendar, Notes, Stats)

**Files:**
- Create: `src/app/api/student/workspace/route.ts`, `src/app/api/student/roadmaps/route.ts`, `src/app/api/student/roadmaps/[slug]/route.ts`, `src/app/api/student/courses/[slug]/route.ts`, `src/app/api/student/modules/[id]/toggle/route.ts`, `src/app/api/student/courses/[id]/quiz/route.ts`, `src/app/api/student/courses/[id]/quiz/submit/route.ts`, `src/app/api/student/courses/[id]/rating/route.ts`, `src/app/api/student/courses/[id]/submission/route.ts`, `src/app/api/student/calendar/route.ts`, `src/app/api/student/tasks/route.ts`, `src/app/api/student/tasks/[id]/route.ts`, `src/app/api/student/notes/route.ts`, `src/app/api/student/notes/[id]/route.ts`, `src/app/api/student/stats/route.ts`, `src/app/api/student/profile/route.ts`
- Test: `tests/api-student.test.ts`

**Interfaces:**
- Consumes: `requireRole('STUDENT')`, `computeRoadmapCourseStates`, `gradeQuizSubmission`, `recordStudyActivity`, `calculateCurrentStreak`, `getMonthRange`, `prisma`

- [ ] **Step 1: Write failing `tests/api-student.test.ts` (`DRAFT` hidden, `correctOptionId`/`explanation` stripped before passing, `400` if modules incomplete, `403` rating before passing, `WorkspaceTask`/`Note` scoped to `userId`, uncheck keeps `DailyActivityLog`) -> verify fail**
- [ ] **Step 2: Implement all `/api/student/*` route handlers**
- [ ] **Step 3: Run tests -> verify pass**
- [ ] **Step 4: Commit**

Commit: `feat: implement student api endpoints`

---

## Sprint 3: Kawaii Stationery UI, Responsive Shell & Student Pages

### Task 7: Stitch Theme Tokens, Zero-Emoji SVG Icons, Stationery Primitives & Tiptap Editor

**Files:**
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/components/icons/CartoonIcons.tsx`, `src/components/ui/PastelPrimitives.tsx`, `src/components/layout/AppShell.tsx`, `src/components/editor/CalloutExtension.ts`, `src/components/editor/RichTextEditor.tsx`, `src/components/editor/LessonRenderer.tsx`
- Test: `tests/ui-components.test.tsx`

**Interfaces:**
- Produces: `AppShell` (desktop top nav + mobile sticky bottom nav bar `<768px`), `WashiCard`, `SquishyButton`, `RibbonTag`, `StickerImage`, `TanyaHusbandButton`, `RichTextEditor`, `LessonRenderer`

- [ ] **Step 1: Write failing `tests/ui-components.test.tsx` (`TanyaHusbandButton` href, `WashiCard` emoji-free, `LessonRenderer` renders `callout` & `codeBlock`, `AppShell` renders mobile bottom nav links) -> verify fail**
- [ ] **Step 2: Implement `Gaegu`/`Mali`/`Patrick Hand` fonts in `layout.tsx`, Stitch tokens & washi-tape/die-cut CSS in `globals.css`, `CartoonIcons.tsx`, `PastelPrimitives.tsx`, `AppShell.tsx`, and Tiptap editor/renderer**
- [ ] **Step 3: Run `npx vitest run tests/ui-components.test.tsx tests/no-emoji.test.ts` -> verify pass**
- [ ] **Step 4: Commit**

Commit: `feat: add kawaii stationery ui kit, responsive shell, and tiptap hypertext editor`

### Task 8: Student Workspace (`/workspace`), Roadmaps & Course Reader (`/learn/[courseSlug]`)

**Files:**
- Create: `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/workspace/page.tsx`, `src/app/roadmaps/page.tsx`, `src/app/roadmaps/[slug]/page.tsx`, `src/app/learn/[courseSlug]/page.tsx`
- Create: `src/components/student/BentoWorkspaceClient.tsx`, `src/components/student/PomodoroWidget.tsx`, `src/components/student/CourseReaderClient.tsx`, `src/components/student/MiniQuizModal.tsx`, `src/components/student/CourseRatingModal.tsx`

- [ ] **Step 1: Build `/login` (with `hirono.png` & pastel stationery card) and `/` role redirect**
- [ ] **Step 2: Build `/workspace` mirroring `student_dashboard_roadmap_silabus` (Welcome Banner + `BELAJAR YUK!` + `bunny-book.png`, Winding Stepped Roadmap Path with `min-w-0 flex-wrap` pills, Right Column: Pomodoro `Fokus Yaa / Rehat Dulu`, Mini Streak Calendar, `TO-DO LIST`, `MY NOTES!`)**
- [ ] **Step 3: Build `/learn/[courseSlug]` mirroring `materi_belajar_course_detail_reader_view` (3-col desktop -> slide-over Syllabus drawer + stacked mobile cards; Tiptap reader, "Tandai Modul Ini Selesai", Pomodoro, Catatan Pribadiku, **"Tanya Husband"** card with `tanya-husband-bubble.png`, Mini Quiz modal with `quiz-bubble-cat.png`, and Course Rating modal with `passed-trophy-bunny.png`)**
- [ ] **Step 4: Verify `npx tsc --noEmit && npx vitest run tests/no-emoji.test.ts` -> commit**

Commit: `feat: build login, workspace dashboard, roadmaps, and course reader with quiz gate`

### Task 9: Student Notes & Tasks (`/notes`), Code Playground (`/playground`), Stats (`/stats`), Calendar & Settings

**Files:**
- Create: `src/app/notes/page.tsx`, `src/app/playground/page.tsx`, `src/app/stats/page.tsx`, `src/app/calendar/page.tsx`, `src/app/settings/page.tsx`
- Create: `src/components/student/NotesTasksClient.tsx`, `src/components/student/CodePlaygroundClient.tsx`, `src/components/student/StatsClient.tsx`, `src/components/student/CalendarPlannerClient.tsx`, `src/components/settings/ProfileSettingsClient.tsx`

- [ ] **Step 1: Build `/notes` mirroring `catatan_tugas_murid` (KPI cards with non-overlapping responsive layout, filter tabs, searchable tag-filtered `MY NOTES!`, To-Do tasks, and optional Course Practice Submission form)**
- [ ] **Step 2: Build `/playground` mirroring `code_playground_interaktif_murid` (`playground-bear-laptop.png`, HTML/CSS/JS tabs, client-only `<iframe sandbox="allow-scripts">`, Desktop/Mobile preview switch, console log panel, starter challenges; stacked on mobile)**
- [ ] **Step 3: Build `/stats` mirroring `statistik_evaluasi_belajar_murid` (4 KPI Washi Cards, 7-day bar chart, 4-week pastel activity heatmap, course mastery & ratings)**
- [ ] **Step 4: Build `/calendar` (full monthly planner) and `/settings` mirroring `pengaturan_profil_notifikasi_siswa_modal_ganti_kata_sandi` (biodata, avatar, `Asia/Jakarta`, Change Password modal — excluding Discord/GitHub/PDF/ZIP bloat)**
- [ ] **Step 5: Verify `npx tsc --noEmit && npx vitest run tests/no-emoji.test.ts` -> commit**

Commit: `feat: build student notes, sandbox code playground, stats, calendar, and settings`

---

## Sprint 4: Teacher Konsol Studio & Responsive E2E Verification

### Task 10: Teacher Konsol (`/admin`), Authoring Studio (`/admin/courses/[id]`), Rubric Grading & Settings

**Files:**
- Create: `src/app/admin/page.tsx`, `src/app/admin/roadmaps/page.tsx`, `src/app/admin/courses/[id]/page.tsx`, `src/app/admin/settings/page.tsx`
- Create: `src/components/admin/AdminKonsolClient.tsx`, `src/components/admin/RubricGradingModal.tsx`, `src/components/admin/RoadmapManagerClient.tsx`, `src/components/admin/CourseEditorClient.tsx`, `src/components/admin/QuizBuilderClient.tsx`

- [ ] **Step 1: Build `/admin` mirroring `konsol_mentor_manajemen_murid` & `detail_rubrik_penilaian_kode_murid` (KPI Washi cards, student roadmap & quiz overview, course ratings, submission review queue + 4-criterion Rubric modal, and Teacher-private Mentor Notes)**
- [ ] **Step 2: Build `/admin/roadmaps` & `/admin/courses/[id]` (Roadmap/Course CRUD, target dates, `DRAFT`/`PUBLISHED`, thumbnail uploader, `<RichTextEditor />` for modules, `"Preview Siswa"` tab using `<LessonRenderer />`, Mini Quiz Builder, and optional practice task toggle)**
- [ ] **Step 3: Build `/admin/settings` (`teacherWhatsapp`, `siteTitle`, Reset Student Password)**
- [ ] **Step 4: Verify `npx tsc --noEmit && npx vitest run tests/no-emoji.test.ts` -> commit**

Commit: `feat: build teacher konsol, authoring studio, preview mode, quiz builder, and rubric modal`

### Task 11: Fullstack & Mobile-Responsive Playwright E2E Verification

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/lms-flow.spec.ts`

- [ ] **Step 1: Write Playwright E2E tests for Desktop (`1280x800`) and Mobile (`390x844`)**

Verify:
1. Teacher logs in -> creates Roadmap + 2 `PUBLISHED` Courses (thumbnail + Tiptap module + 2-question Mini Quiz) + sets WhatsApp number.
2. Student logs in -> verifies Course 2 `LOCKED` -> verifies `"Tanya Husband"` href contains encoded course & module title -> completes Course 1 modules -> fails quiz once (Course 2 still locked, no leaked answers) -> passes quiz (Course 2 `UNLOCKED`, Streak = 1, submits 5-star Course Rating).
3. Student tests `/notes` task/note creation, `/playground` live HTML/JS render, `/stats` heatmap, and `/workspace` calendar sync.
4. Mobile viewport (`390x844`) visits `/workspace`, `/learn/[courseSlug]`, `/notes`, `/playground`, `/stats`, `/admin` and asserts `scrollWidth <= innerWidth` (zero horizontal page overflow) and visible mobile bottom navigation bar.
5. DOM text scan across routes confirms zero Unicode emojis.

- [ ] **Step 2: Run full verification suite**

Run: `npx tsc --noEmit && npm test && npx playwright test`
Expected: All TypeScript, Vitest (`no-emoji`, `date`, `auth`, `whatsapp`, `storage`, `progression`, `streak`, `api-admin`, `api-student`, `ui-components`), and Playwright Desktop+Mobile E2E tests PASS.

- [ ] **Step 3: Commit**

Commit: `test: add desktop and mobile playwright e2e verification suite`
