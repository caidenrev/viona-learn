import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getPublishedRoadmapCourseStates } from "@/lib/student-course-access";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id: courseId } = await context.params;

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: "PUBLISHED",
        roadmap: { status: "PUBLISHED" },
      },
      include: {
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

    const passed = state.effectiveStatus === "PASSED";

    const questions = course.quizQuestions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      orderIndex: q.orderIndex,
      ...(passed
        ? {
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
          }
        : {}),
    }));

    return NextResponse.json({
      passingScore: course.passingScore,
      passed,
      bestScore: state.bestScore,
      questions,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
