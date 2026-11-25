import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getPublishedRoadmapCourseStates } from "@/lib/student-course-access";

const submissionSchema = z.object({
  repoUrl: z.string().trim().url().nullable().optional(),
  demoUrl: z.string().trim().url().nullable().optional(),
  studentNote: z.string().trim().max(1000).nullable().optional(),
});

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id: courseId } = await context.params;
    const data = submissionSchema.parse(await req.json());

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: "PUBLISHED",
        hasPracticeTask: true,
        roadmap: { status: "PUBLISHED" },
      },
      select: { id: true, roadmapId: true },
    });
    if (!course) {
      return NextResponse.json(
        { error: "Course atau tugas praktek tidak ditemukan." },
        { status: 404 }
      );
    }

    const states = await getPublishedRoadmapCourseStates(
      student.userId,
      course.roadmapId
    );
    const state = states.get(course.id);
    if (!state || state.effectiveStatus === "LOCKED") {
      return NextResponse.json({ error: "Course masih terkunci." }, { status: 403 });
    }

    const submission = await prisma.courseSubmission.upsert({
      where: {
        userId_courseId: { userId: student.userId, courseId: course.id },
      },
      update: {
        repoUrl: data.repoUrl ?? null,
        demoUrl: data.demoUrl ?? null,
        studentNote: data.studentNote ?? null,
        status: "PENDING",
      },
      create: {
        userId: student.userId,
        courseId: course.id,
        repoUrl: data.repoUrl ?? null,
        demoUrl: data.demoUrl ?? null,
        studentNote: data.studentNote ?? null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ submission });
  } catch (err) {
    return handleApiError(err);
  }
}
