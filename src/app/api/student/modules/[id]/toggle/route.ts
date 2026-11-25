import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { recordStudyActivity } from "@/lib/streak";
import { getPublishedRoadmapCourseStates } from "@/lib/student-course-access";

const toggleSchema = z.object({
  completed: z.boolean(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id: moduleId } = await context.params;
    const { completed } = toggleSchema.parse(await req.json());

    const mod = await prisma.module.findFirst({
      where: {
        id: moduleId,
        status: "PUBLISHED",
        course: { status: "PUBLISHED", roadmap: { status: "PUBLISHED" } },
      },
      include: {
        course: { select: { id: true, roadmapId: true } },
      },
    });

    if (!mod) {
      return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
    }

    const states = await getPublishedRoadmapCourseStates(
      student.userId,
      mod.course.roadmapId
    );
    const courseState = states.get(mod.course.id);
    if (!courseState || courseState.effectiveStatus === "LOCKED") {
      return NextResponse.json({ error: "Course masih terkunci." }, { status: 403 });
    }

    if (completed) {
      await prisma.moduleProgress.upsert({
        where: {
          userId_moduleId: { userId: student.userId, moduleId },
        },
        update: {},
        create: {
          userId: student.userId,
          moduleId,
        },
      });
      // Append-only streak log: unchecking later will never revoke today's earned credit.
      await recordStudyActivity(prisma, {
        userId: student.userId,
        sourceType: "MODULE",
        sourceId: moduleId,
        minutes: mod.estimatedMinutes,
      });
    } else {
      await prisma.moduleProgress.deleteMany({
        where: { userId: student.userId, moduleId },
      });
    }

    return NextResponse.json({ ok: true, completed });
  } catch (err) {
    return handleApiError(err);
  }
}
