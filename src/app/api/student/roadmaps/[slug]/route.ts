import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { computeRoadmapCourseStates } from "@/lib/progression";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { slug } = await context.params;
    const roadmap = await prisma.roadmap.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        courses: {
          where: { status: "PUBLISHED" },
          orderBy: { orderIndex: "asc" },
          include: {
            modules: {
              where: { status: "PUBLISHED" },
              select: { id: true },
            },
          },
        },
      },
    });
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap tidak ditemukan." }, { status: 404 });
    }

    const [courseProgresses, moduleProgresses] = await Promise.all([
      prisma.courseProgress.findMany({ where: { userId: student.userId } }),
      prisma.moduleProgress.findMany({
        where: { userId: student.userId },
        select: { moduleId: true },
      }),
    ]);

    const completedSet = new Set(moduleProgresses.map((m) => m.moduleId));
    const progressMap = new Map(
      courseProgresses.map((p) => [
        p.courseId,
        { status: p.status, bestScore: p.bestScore },
      ])
    );
    const states = computeRoadmapCourseStates(roadmap.courses, progressMap);
    const stateMap = new Map(states.map((s) => [s.courseId, s]));

    return NextResponse.json({
      roadmap: {
        ...roadmap,
        courses: roadmap.courses.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          summary: c.summary,
          thumbnailUrl: c.thumbnailUrl,
          targetDate: c.targetDate,
          orderIndex: c.orderIndex,
          effectiveStatus: stateMap.get(c.id)?.effectiveStatus ?? "LOCKED",
          bestScore: stateMap.get(c.id)?.bestScore ?? 0,
          totalModules: c.modules.length,
          completedModules: c.modules.filter((m) => completedSet.has(m.id)).length,
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
