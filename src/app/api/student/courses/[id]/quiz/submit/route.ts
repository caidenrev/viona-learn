import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { gradeQuizSubmission } from "@/lib/progression";
import { recordStudyActivity } from "@/lib/streak";
import { getPublishedRoadmapCourseStates } from "@/lib/student-course-access";

const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id: courseId } = await context.params;
    const { answers } = submitQuizSchema.parse(await req.json());

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: "PUBLISHED",
        roadmap: { status: "PUBLISHED" },
      },
      include: {
        modules: {
          where: { status: "PUBLISHED" },
          select: { id: true, estimatedMinutes: true },
        },
        quizQuestions: { orderBy: { orderIndex: "asc" } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course tidak ditemukan." }, { status: 404 });
    }

    const states = await getPublishedRoadmapCourseStates(
      student.userId,
      course.roadmapId
    );
    const state = states.get(course.id);
    if (!state || state.effectiveStatus === "LOCKED") {
      return NextResponse.json({ error: "Course masih terkunci." }, { status: 403 });
    }

    const completedModules = await prisma.moduleProgress.findMany({
      where: {
        userId: student.userId,
        moduleId: { in: course.modules.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    const completedSet = new Set(completedModules.map((m) => m.moduleId));
    if (
      course.modules.length === 0 ||
      course.modules.some((m) => !completedSet.has(m.id))
    ) {
      return NextResponse.json(
        { error: "Selesaikan semua modul di course ini sebelum mengerjakan Mini Quiz." },
        { status: 400 }
      );
    }

    const result = gradeQuizSubmission({
      questions: course.quizQuestions,
      answers,
      passingScore: course.passingScore,
    });

    await prisma.quizAttempt.create({
      data: {
        userId: student.userId,
        courseId: course.id,
        answers,
        score: result.score,
        passed: result.passed,
      },
    });

    const newBest = Math.max(state.bestScore, result.score);

    if (result.passed) {
      await prisma.courseProgress.upsert({
        where: {
          userId_courseId: { userId: student.userId, courseId: course.id },
        },
        update: {
          status: "PASSED",
          bestScore: newBest,
          passedAt: new Date(),
        },
        create: {
          userId: student.userId,
          courseId: course.id,
          status: "PASSED",
          bestScore: newBest,
          passedAt: new Date(),
        },
      });

      await recordStudyActivity(prisma, {
        userId: student.userId,
        sourceType: "QUIZ",
        sourceId: course.id,
        minutes: 10,
      });
    } else {
      await prisma.courseProgress.upsert({
        where: {
          userId_courseId: { userId: student.userId, courseId: course.id },
        },
        update: {
          bestScore: newBest,
        },
        create: {
          userId: student.userId,
          courseId: course.id,
          status: "UNLOCKED",
          bestScore: newBest,
        },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
