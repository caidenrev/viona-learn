# Viona Learn Room (Belajar Yuk!) — PRD, Requirements & Design Specification

**Date:** 2026-11-25
**Status:** Finalized (Aligned with Google Stitch UI & Mobile Responsive)
**Design Reference:** [DESIGN.md](file:///d:/viona-learn-room/stitch_personal_pastel_lms_platform/kawaii_stationery_planner/DESIGN.md) & `stitch_personal_pastel_lms_platform/`
**Workspace Rules:** [AGENTS.md](file:///d:/viona-learn-room/AGENTS.md)

## 1. Product Vision & Scope

**Viona Learn Room ("Belajar Yuk!")** is a private, fullstack personal Learning Management System (LMS) and daily study planner built exclusively for two users: one **Teacher/Mentor** (admin) and one **Student** (his girlfriend).

It merges:
1. **Structured Roadmap LMS (Dicoding / AWS Educate style):** Custom learning roadmaps (Frontend, Backend, AI literacy, rapid app-building), modular rich-text lessons, mandatory end-of-course **Mini Quiz** gates, optional practice project submissions with mentor rubric feedback, **Course Ratings**, and a contextual **"Tanya Husband"** WhatsApp help button.
2. **Comprehensive Daily Workspace:** Interactive Pomodoro focus timer (*Fokus Yaa / Rehat Dulu*), synchronized **Calendar**, **TO-DO LIST**, **MY NOTES!** binder, interactive client-side **Code Playground**, **Statistik & Evaluasi Belajar**, and an `Asia/Jakarta` **Daily Streak** tracker.
3. **Kawaii Stationery Planner Aesthetic (Google Stitch):** Warm Milk Ivory (`#FAF7F2` / `#fcf9f4`) paper canvas, Sakura Pink (`#FFAAA6`), Pastel Lilac (`#C8B6FF`), Butter Yellow (`#FFF3B0`), Pastel Mint (`#C6E9EE`), Cocoa Ink (`#4A3E3D`), `Gaegu` / `Mali` / `Patrick Hand` typography, translucent washi-tape corners, die-cut sticker borders, squishy 3D tactile buttons, custom cartoon SVGs, `hirono.png`, and Nano Banana PNG stickers—with **zero OS/Unicode emojis** anywhere.

## 2. Stitch UI Screen Mapping & Adaptation

Every screen in `stitch_personal_pastel_lms_platform/` maps to a real route in the app (replacing Stitch placeholder names like "Kak Sarah"/"Budi Utomo" with real 2-user Teacher/Student profiles, removing all emojis such as `⭐`, and adding full mobile responsiveness):

| Stitch Reference Folder | App Route | Role | Real Functionality & Adaptations |
|---|---|---|---|
| `student_dashboard_roadmap_silabus` | `/workspace` | `STUDENT` | Welcome motivation banner (*BELAJAR YUK!*, streak, weekly target, `hirono.png` / bunny sticker), Winding Stepped Roadmap Path (`PASSED`/`UNLOCKED`/`LOCKED`), Right Column: Pomodoro Focus Timer (*Fokus Yaa / Rehat Dulu*), Monthly Streak Calendar, *TO-DO LIST*, *MY NOTES!*. |
| `materi_belajar_course_detail_reader_view` | `/learn/[courseSlug]` | `STUDENT` | 3-col desktop / drawer+stacked mobile: Left Course Syllabus & Attachments; Center Video/Embed + Tiptap Rich-Text Lesson (Callouts, Code Blocks) + Completion Toggle + End-of-Course **Mini Quiz Gate** (`quiz-bubble-cat.png`) + **Course Rating** (`passed-trophy-bunny.png`); Right Pomodoro Timer, *Catatan Pribadiku*, **"Tanya Husband"** WhatsApp card (`tanya-husband-bubble.png`), Target Checklist. |
| `catatan_tugas_murid` | `/notes` | `STUDENT` | *Catatan & Tugas Belajar* binder: KPI Washi cards, filter tabs (`Semua`, `Tugas & Proyek`, `Catatan Pribadi`, `Perlu Direvisi`, `Sudah Dinilai`), searchable tag-filtered *MY NOTES!*, To-Do tasks, and Practice Project Submission drawer (for courses with `hasPracticeTask`). |
| `code_playground_interaktif_murid` | `/playground` | `STUDENT` | Live HTML/CSS/JS sandboxed `iframe` editor (`playground-bear-laptop.png`), Desktop/Mobile preview toggle, live console output, and starter coding challenges. Client-side execution only. |
| `statistik_evaluasi_belajar_murid` | `/stats` | `STUDENT` | *Statistik & Evaluasi Belajar*: 4 KPI Washi Cards (Streak, Completed Modules, Quiz Average, Syllabus Progress), 7-day activity chart, 4-week pastel activity heatmap from `DailyActivity`, course quiz history & ratings. |
| `konsol_mentor_manajemen_murid` + `detail_rubrik_penilaian_kode_murid` | `/admin`, `/admin/roadmaps`, `/admin/courses/[id]` | `TEACHER` | *Konsol Guru & Pembimbing*: Student KPIs, Roadmap/Course/Module Studio with **Tiptap Hypertext Editor** + Thumbnail Upload + `"Preview Siswa"` mode + Mini Quiz Builder, Practice Submission Review & 4-criterion Rubric Modal, plus Teacher-private Mentor Notes. |
| `pengaturan_profil_notifikasi_siswa_modal_ganti_kata_sandi` | `/settings`, `/admin/settings` | Both | Profile card (avatar upload/`hirono.png`, nickname, motto, `Asia/Jakarta`, focus window), Change Password Modal. Teacher `/admin/settings` adds `teacherWhatsapp`, `siteTitle`, and Reset Student Password. |

**Explicitly Excluded Stitch Mock Bloat (Do Not Build):**
- Discord bot, GitHub OAuth/webhook auto-sync, Vercel Deploy webhook, email push-notification server, PDF Rapor generator, and `.zip` export modal (excluded to keep the 2-user personal LMS focused and free of unused integrations).

## 3. Mobile Responsiveness Requirements (Mandatory)

Stitch HTML exports were desktop-focused (`hidden md:flex` on `<nav>`) and had minor badge-clipping bugs. The Next.js implementation MUST enforce:
1. **Mobile Navigation (`< 768px`):** Fixed bottom stationery navigation bar (5 concise items with custom SVG icons: `Home`, `Belajar`, `Catatan`, `Code`, `Statistik`, plus `Konsol` for Teacher) + header streak pill & avatar menu.
2. **Breakpoints:**
   - **Desktop (`>= 1024px`):** 12-column Bento grid; 3-column `/learn/[courseSlug]` desk; side-by-side `/playground` editor & preview.
   - **Tablet (`768px - 1023px`):** 8-column grid; collapsible syllabus drawer on `/learn/[courseSlug]`.
   - **Mobile (`< 768px`):** Single-column stacked stationery cards (`px-4`), slide-over drawer for Course Syllabus, stacked Editor -> Preview -> Console in `/playground`, `min-h-[44px]` touch targets on all buttons/checkboxes, `overflow-x-hidden` on outer shells (horizontal scroll inside `<pre><code>` only).
3. **Zero Clipping:** Never use rigid heights on pills/buttons/KPI cards; use `min-w-0`, `flex-wrap`, and `leading-snug` so badges like `Selesai`, `Lanjut Belajar`, and KPI totals never overlap on `390px` screens.

## 4. Visual Tokens, Assets & Zero-Emoji Rules

- **Palette (`Kawaii Stationery Planner`):**
  - `--surface: #fcf9f4`, `--milk-ivory: #FAF7F2`, `--surface-lowest: #ffffff`, `--surface-low: #f6f3ee`
  - `--sakura-pink: #FFAAA6`, `--sakura-deep: #8E4B49`, `--pastel-lilac: #C8B6FF`, `--lilac-deep: #645495`, `--butter-yellow: #FFF3B0`, `--mint-fixed: #C6E9EE`
  - `--cocoa-ink: #4A3E3D`, `--soft-latte: #8D6E63`, `--sticker-stroke: #EADFD5`
- **Fonts:** `Gaegu` (Display/Headings), `Mali` (Labels/Buttons/Chips), `Patrick Hand` (Body/Notes), monospace for code.
- **Zero-Emoji Guard:** No OS/Unicode emojis (`\p{Extended_Pictographic}`) anywhere in `src/` or `prisma/`. Verified automatically by `tests/no-emoji.test.ts`.
- **Sticker Assets (`public/stickers/`):**
  - Mascot: `public/stickers/hirono.png` (outer white background removed)
  - Nano Banana Generated Stickers (all converted to true transparent PNGs with zero white background):
    - `public/stickers/welcome-bunny-reading.png` (`/workspace` Welcome Hero Banner)
    - `public/stickers/pomodoro-focus-cat.png` (Pomodoro Focus Timer *Fokus Yaa / Rehat Dulu* on `/workspace` & `/learn/[courseSlug]`)
    - `public/stickers/streak-sparkle-star.png` (Daily Streak badge & `/stats` Weekly Streak card)
    - `public/stickers/quiz-bubble-cat.png` (Mini Quiz gate & modal header)
    - `public/stickers/passed-trophy-bunny.png` (Quiz pass & Course Rating celebration)
    - `public/stickers/tanya-husband-bubble.png` (Tanya Husband WhatsApp card)
    - `public/stickers/notes-bear-memo.png` (`/notes` binder header & *MY NOTES!* empty state)
    - `public/stickers/playground-bear-laptop.png` (Interactive Code Playground header)
    - `public/stickers/mentor-bear-desk.png` (`/admin` Konsol Guru & Pembimbing header)
  - Curated Sliced Sheet Stickers (`public/stickers/sheet-*.png`, 30 transparent PNG cutouts from the user's two sticker sheets): `sheet-bunny-book.png`, `sheet-bear-desk.png`, `sheet-cat-fokus.png`, `sheet-books-ribbon.png`, `sheet-laptop-hearts.png`, `sheet-coffee-semangat.png`, `sheet-lamp.png`, `sheet-bow-pink.png`, `sheet-bow-blue.png`, `sheet-pencil-case.png`, `sheet-alarm-clock.png`, `sheet-my-notes-bunny.png`, `sheet-my-notes-bear.png`, `sheet-todo-bear.png`, `sheet-todo-circle-pink.png`, `sheet-todo-circle-lilac.png`, `sheet-ribbon-semangat.png`, `sheet-ribbon-belajar-yuk.png`, `sheet-banner-belajar-yuk.png`, `sheet-ribbon-todays-goal.png`, `sheet-bubble-rehat-dulu.png`, `sheet-bubble-bisa-kok.png`, `sheet-sticky-semangat.png`, `sheet-bunting-flags.png`, `sheet-backpack-pink.png`, `sheet-bunny-pencil.png`, `sheet-bear-laptop.png`, `sheet-cat-books.png`, `sheet-headphones.png`, `sheet-calendar-hearts.png`.

## 5. AI Agent Anti-Hallucination Boundaries

1. **Closed 2-Account System:** Only `TEACHER` and `STUDENT` roles exist; `/register` never exists. Credentials seeded idempotently from env (`SEED_TEACHER_*`, `SEED_STUDENT_*`) without overwriting live passwords.
2. **Role & Privacy Isolation:** `/api/admin/*` and `/admin/*` require `TEACHER`; `/api/student/*`, `/workspace`, `/learn`, `/notes`, `/playground`, `/stats` require `STUDENT`. `WorkspaceTask` and Student `Note` are strictly scoped by `userId` and excluded from `/admin`. `MentorPrivateNote` is strictly `TEACHER`-only and excluded from `/api/student/*`.
3. **Quiz & Draft Security:** Student endpoints filter `status: "PUBLISHED"` for Roadmaps, Courses, and Modules. `GET /api/student/courses/[id]/quiz` strips `correctOptionId` and `explanation` when `CourseProgress.status !== "PASSED"`. `POST .../quiz/submit` requires all `PUBLISHED` modules in that course to be completed (`ModuleProgress`) and rejects 0-question quizzes with `400`. Failed attempts allow unlimited retakes without exposing `correctOptionId`/`explanation`.
4. **Timezone & Streak Integrity:** All `dateKey` (`"YYYY-MM-DD"`) computations use `toJakartaDateKey()` (`Asia/Jakarta`, `UTC+7`). `DailyActivityLog` is append-only per `[userId, dateKey, sourceType, sourceId]`; unchecking a completed module/task never revokes today's streak credit and re-toggling never double-counts.
5. **Upload Safety:** `POST /api/admin/upload` validates MIME + magic bytes (`png`, `jpeg`, `webp`) and enforces `<= 5 MB`.
6. **Playground Sandbox:** `/playground` runs strictly in a client `<iframe sandbox="allow-scripts">`; zero server code execution.

## 6. Data Model (`prisma/schema.prisma`)

- **Enums:** `Role` (`TEACHER`, `STUDENT`), `PublishStatus` (`DRAFT`, `PUBLISHED`), `CourseProgressStatus` (`LOCKED`, `UNLOCKED`, `PASSED`), `TaskCategory` (`STUDY`, `PERSONAL`), `ActivitySource` (`MODULE`, `QUIZ`, `STUDY_TASK`, `PLAYGROUND`), `NoteColor` (`PINK`, `BUTTER`, `MINT`, `LAV`), `SubmissionStatus` (`PENDING`, `REVIEWED`, `REVISION`).
- **Models:**
  - `User`: `id`, `username` (unique), `name`, `nickname`, `dreamTarget`, `bio`, `focusWindow`, `passwordHash`, `role`, `avatarUrl`, `createdAt`, `updatedAt`
  - `AppSettings`: `id` (`"default"`), `teacherWhatsapp`, `siteTitle`, `updatedAt`
  - `Roadmap`: `id`, `title`, `slug` (unique), `description`, `levelLabel`, `targetDate`, `status`, `orderIndex`, `createdAt`, `updatedAt`
  - `Course`: `id`, `roadmapId`, `title`, `slug` (unique), `summary`, `thumbnailUrl`, `targetDate`, `status`, `orderIndex`, `passingScore` (default `70`), `hasPracticeTask` (default `false`), `practicePrompt` (`String?`), `createdAt`, `updatedAt`
  - `Module`: `id`, `courseId`, `chapterTitle`, `title`, `orderIndex`, `contentJson` (`Json`), `videoUrl` (`String?`), `attachments` (`Json?`), `estimatedMinutes` (default `10`), `status`, `createdAt`, `updatedAt`
  - `QuizQuestion`: `id`, `courseId`, `prompt`, `options` (`Json`), `correctOptionId`, `explanation`, `orderIndex`
  - `ModuleProgress`: `id`, `userId`, `moduleId`, `completedAt` (`@@unique([userId, moduleId])`)
  - `QuizAttempt`: `id`, `userId`, `courseId`, `answers` (`Json`), `score`, `passed`, `createdAt`
  - `CourseProgress`: `id`, `userId`, `courseId`, `status`, `bestScore`, `passedAt` (`@@unique([userId, courseId])`)
  - `CourseRating`: `id`, `userId`, `courseId`, `stars`, `review`, `createdAt`, `updatedAt` (`@@unique([userId, courseId])`)
  - `CourseSubmission`: `id`, `userId`, `courseId`, `repoUrl`, `demoUrl`, `studentNote`, `status` (`SubmissionStatus`), `score` (`Int?`), `rubricJson` (`Json?`), `mentorFeedback` (`String?`), `updatedAt` (`@@unique([userId, courseId])`)
  - `WorkspaceTask`: `id`, `userId`, `title`, `dueDate`, `isTodayGoal`, `completed`, `completedAt`, `category`, `courseId`, `moduleId`, `createdAt`, `updatedAt`
  - `Note`: `id`, `userId`, `title`, `body`, `tags` (`String[]`), `checklist` (`Json?`), `dateKey`, `courseId`, `color`, `createdAt`, `updatedAt`
  - `MentorPrivateNote`: `id`, `authorId`, `title`, `body`, `createdAt`, `updatedAt`
  - `DailyActivity`: `id`, `userId`, `dateKey`, `activityCount`, `studyMinutes` (`Int @default(0)`), `@@unique([userId, dateKey])`
  - `DailyActivityLog`: `id`, `userId`, `dateKey`, `sourceType`, `sourceId`, `createdAt` (`@@unique([userId, dateKey, sourceType, sourceId])`)

## 7. Sprint Breakdown Overview

- **Sprint 1 — Foundation, Sticker Pipeline, DB & Auth:** Project scaffold, `Gaegu`/`Mali`/`Patrick Hand` fonts, Stitch theme tokens, sticker slicing + zero-emoji guard, Prisma schema & idempotent seed, 2-role session auth & middleware.
- **Sprint 2 — Core Domain Engines & Fullstack APIs:** Jakarta date/streak engine, Quiz Gate progression, WhatsApp `"Tanya Husband"` builder, Image upload validator, all `/api/admin/*` and `/api/student/*` endpoints.
- **Sprint 3 — Kawaii Stationery UI, Responsive Shell, Student Workspace & Reader:** Responsive desktop + mobile bottom-nav shell, `/login`, `/workspace`, `/learn/[courseSlug]` (Tiptap reader + Pomodoro + Mini Quiz + Course Rating + Tanya Husband), `/notes`, `/playground`, `/stats`, `/settings`.
- **Sprint 4 — Teacher Konsol Studio, Rubric Grading & E2E Responsive Verification:** `/admin` Konsol Mentor (Overview, Roadmap/Course/Module Tiptap Studio, Preview Mode, Quiz Builder, Submission Rubric Modal, Mentor Private Notes, Settings) + Playwright desktop (`1280x800`) & mobile (`390x844`) E2E suite.
