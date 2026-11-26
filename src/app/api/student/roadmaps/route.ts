import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { computeRoadmapCourseStates } from "@/lib/progression";

export async function GET() {
  try {
    const student = await requireRole("STUDENT");
    const [playlists, roadmaps, progresses] = await Promise.all([
      prisma.playlist.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.roadmap.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ playlistId: null }, { playlist: { status: "PUBLISHED" } }],
        },
        orderBy: { orderIndex: "asc" },
        include: {
          playlist: { select: { id: true, title: true, slug: true, color: true } },
          courses: {
            where: { status: "PUBLISHED" },
            orderBy: { orderIndex: "asc" },
            include: {
              _count: { select: { modules: { where: { status: "PUBLISHED" } } } },
            },
          },
        },
      }),
      prisma.courseProgress.findMany({ where: { userId: student.userId } }),
    ]);

    const progressMap = new Map(
      progresses.map((p) => [p.courseId, { status: p.status, bestScore: p.bestScore }])
    );

    const data = roadmaps.map((rm) => {
      const states = computeRoadmapCourseStates(rm.courses, progressMap);
      const stateMap = new Map(states.map((s) => [s.courseId, s]));
      return {
        ...rm,
        courses: rm.courses.map((c) => ({
          ...c,
          effectiveStatus: stateMap.get(c.id)?.effectiveStatus ?? "LOCKED",
          bestScore: stateMap.get(c.id)?.bestScore ?? 0,
        })),
      };
    });

    return NextResponse.json({ playlists, roadmaps: data });
  } catch (err) {
    return handleApiError(err);
  }
}
