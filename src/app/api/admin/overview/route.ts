import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateCurrentStreak } from "@/lib/streak";

export async function GET() {
  try {
    const teacher = await requireRole("TEACHER");

    const student = await prisma.user.findUnique({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatarUrl: true,
        dreamTarget: true,
      },
    });

    const roadmaps = await prisma.roadmap.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        courses: {
          orderBy: { orderIndex: "asc" },
          include: {
            modules: { select: { id: true, status: true } },
            courseProgresses: student
              ? { where: { userId: student.id } }
              : false,
          },
        },
      },
    });

    const activities = student
      ? await prisma.dailyActivity.findMany({
          where: { userId: student.id },
          orderBy: { dateKey: "desc" },
          take: 60,
        })
      : [];

    const streak = calculateCurrentStreak(
      activities.map((a) => a.dateKey),
      getJakartaTodayKey()
    );

    const ratings = await prisma.courseRating.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    const submissions = await prisma.courseSubmission.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    const mentorNotes = await prisma.mentorPrivateNote.findMany({
      where: { authorId: teacher.userId },
      orderBy: { updatedAt: "desc" },
    });

    // Privacy boundary: WorkspaceTask and student Note are intentionally excluded.
    return NextResponse.json({
      student,
      streak,
      roadmaps,
      ratings,
      quizAttempts,
      submissions,
      mentorNotes,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
