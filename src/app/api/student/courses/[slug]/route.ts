import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getPublishedRoadmapCourseStates } from "@/lib/student-course-access";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { slug } = await context.params;

    const course = await prisma.course.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        roadmap: { status: "PUBLISHED" },
      },
      include: {
        roadmap: { select: { id: true, title: true, slug: true } },
        modules: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
        },
        _count: { select: { quizQuestions: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course tidak ditemukan." }, { status: 404 });
    }

    const states = await getPublishedRoadmapCourseStates(
      student.userId,
      course.roadmapId
    );
    const courseState = states.get(course.id);
    if (!courseState || courseState.effectiveStatus === "LOCKED") {
      return NextResponse.json(
        { error: "Course ini masih terkunci. Selesaikan course sebelumnya dulu." },
        { status: 403 }
      );
    }

    const [moduleProgresses, rating, submission, settings, notes] = await Promise.all([
      prisma.moduleProgress.findMany({
        where: {
          userId: student.userId,
          moduleId: { in: course.modules.map((m) => m.id) },
        },
        select: { moduleId: true },
      }),
      prisma.courseRating.findUnique({
        where: {
          userId_courseId: { userId: student.userId, courseId: course.id },
        },
      }),
      prisma.courseSubmission.findUnique({
        where: {
          userId_courseId: { userId: student.userId, courseId: course.id },
        },
      }),
      prisma.appSettings.findUnique({ where: { id: "default" } }),
      prisma.note.findMany({
        where: { userId: student.userId, courseId: course.id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const completedModuleIds = moduleProgresses.map((m) => m.moduleId);
    const allModulesCompleted =
      course.modules.length > 0 &&
      course.modules.every((m) => completedModuleIds.includes(m.id));

    return NextResponse.json({
      course: {
        ...course,
        effectiveStatus: courseState.effectiveStatus,
        bestScore: courseState.bestScore,
      },
      completedModuleIds,
      allModulesCompleted,
      quizEligible: allModulesCompleted && course._count.quizQuestions > 0,
      rating,
      submission,
      notes,
      teacherWhatsapp: settings?.teacherWhatsapp ?? "",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
