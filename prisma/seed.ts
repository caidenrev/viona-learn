import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";

export interface SeedEnv {
  SEED_TEACHER_USERNAME?: string;
  SEED_TEACHER_PASSWORD?: string;
  SEED_STUDENT_USERNAME?: string;
  SEED_STUDENT_PASSWORD?: string;
  SEED_TEACHER_WHATSAPP?: string;
}

/**
 * Idempotently provisions the closed 2-account setup, AppSettings, and a starter Roadmap.
 * Never overwrites existing user passwords on subsequent runs.
 */
export async function seedDatabase(
  db: PrismaClient,
  env: SeedEnv = process.env as SeedEnv
): Promise<void> {
  const teacherUsername = env.SEED_TEACHER_USERNAME ?? "mentor";
  const teacherPassword = env.SEED_TEACHER_PASSWORD ?? "change-me-teacher";
  const studentUsername = env.SEED_STUDENT_USERNAME ?? "viona";
  const studentPassword = env.SEED_STUDENT_PASSWORD ?? "change-me-student";
  const teacherWhatsapp = env.SEED_TEACHER_WHATSAPP ?? "6281234567890";

  const existingTeacher = await db.user.findUnique({
    where: { role: Role.TEACHER },
  });
  if (!existingTeacher) {
    await db.user.create({
      data: {
        username: teacherUsername,
        name: "Husband Mentor",
        nickname: "Mentor",
        passwordHash: await bcrypt.hash(teacherPassword, 10),
        role: Role.TEACHER,
        avatarUrl: "/stickers/mentor-bear-desk.png",
      },
    });
  }

  const existingStudent = await db.user.findUnique({
    where: { role: Role.STUDENT },
  });
  if (!existingStudent) {
    await db.user.create({
      data: {
        username: studentUsername,
        name: "Viona",
        nickname: "Viona",
        dreamTarget: "Fullstack & AI App Builder",
        bio: "Semangat belajar step by step bersama workspace pastel.",
        focusWindow: "19:30 - 21:00 WIB",
        passwordHash: await bcrypt.hash(studentPassword, 10),
        role: Role.STUDENT,
        avatarUrl: "/stickers/hirono.png",
      },
    });
  }

  await db.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      teacherWhatsapp,
      siteTitle: "Belajar Yuk!",
    },
  });

  const existingRoadmap = await db.roadmap.findUnique({
    where: { slug: "jalur-belajar-fullstack-ai" },
  });
  if (!existingRoadmap) {
    await db.roadmap.create({
      data: {
        title: "Jalur Belajar Fullstack & AI",
        slug: "jalur-belajar-fullstack-ai",
        description:
          "Roadmap terstruktur dari pondasi Frontend, Backend API, hingga edukasi penggunaan AI untuk membangun aplikasi dengan cepat.",
        levelLabel: "Dasar - Mahir",
        status: "PUBLISHED",
        orderIndex: 1,
        courses: {
          create: [
            {
              title: "1. HTML, CSS & Layout Pastel",
              slug: "html-css-layout-pastel",
              summary:
                "Belajar struktur HTML semantik, Flexbox, Grid, dan komponen responsif ramah mobile.",
              status: "PUBLISHED",
              orderIndex: 1,
              passingScore: 70,
              hasPracticeTask: true,
              practicePrompt:
                "Buat kartu profil pastel sederhana di Code Playground lalu kirim link atau catatan belajarmu.",
              modules: {
                create: [
                  {
                    chapterTitle: "Bab 1: Pondasi Web",
                    title: "1.1 Mengenal Struktur HTML Semantik",
                    orderIndex: 1,
                    estimatedMinutes: 15,
                    status: "PUBLISHED",
                    contentJson: {
                      type: "doc",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 2 },
                          content: [{ type: "text", text: "Kenapa HTML Semantik Penting?" }],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "Tag seperti header, main, nav, dan section membuat halaman lebih rapi untuk browser, screen reader, dan styling responsif.",
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
              quizQuestions: {
                create: [
                  {
                    prompt:
                      "Elemen HTML mana yang paling tepat untuk membungkus konten utama halaman?",
                    options: [
                      { id: "a", text: "<main>" },
                      { id: "b", text: "<div>" },
                      { id: "c", text: "<span>" },
                    ],
                    correctOptionId: "a",
                    explanation:
                      "Tag <main> menandakan konten utama unik di halaman secara semantik.",
                    orderIndex: 1,
                  },
                ],
              },
            },
            {
              title: "2. Edukasi AI & Bikin App Cepat",
              slug: "edukasi-ai-bikin-app-cepat",
              summary:
                "Cara memecah ide menjadi spesifikasi, prompting efektif, dan menjaga kualitas kode.",
              status: "PUBLISHED",
              orderIndex: 2,
              passingScore: 70,
              modules: {
                create: [
                  {
                    chapterTitle: "Bab 1: Berpikir Terstruktur",
                    title: "2.1 Merancang Prompt & Batasan Fitur",
                    orderIndex: 1,
                    estimatedMinutes: 20,
                    status: "PUBLISHED",
                    contentJson: {
                      type: "doc",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "Mulailah dari tujuan user, struktur data, dan batasan yang jelas sebelum menyuruh AI menulis kode.",
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
              quizQuestions: {
                create: [
                  {
                    prompt:
                      "Langkah terbaik sebelum meminta AI membuat fitur baru adalah?",
                    options: [
                      { id: "a", text: "Langsung minta semua file tanpa batasan" },
                      { id: "b", text: "Tulis tujuan, alur data, dan batasan dengan jelas" },
                      { id: "c", text: "Abaikan pengujian" },
                    ],
                    correctOptionId: "b",
                    explanation:
                      "Spesifikasi yang jelas mencegah AI berhalusinasi dan membuat kode tetap terarah.",
                    orderIndex: 1,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }
}

const isDirectExecution =
  typeof process !== "undefined" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  const client = new PrismaClient();
  seedDatabase(client)
    .then(async () => {
      await client.$disconnect();
    })
    .catch(async (err) => {
      console.error(err);
      await client.$disconnect();
      process.exit(1);
    });
}
