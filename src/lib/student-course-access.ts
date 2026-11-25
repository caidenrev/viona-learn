import { prisma } from "@/lib/prisma";
import { computeRoadmapCourseStates, type CourseStatus } from "@/lib/progression";

export async function getPublishedRoadmapCourseStates(
  userId: string,
  roadmapId: string
): Promise<Map<string, { effectiveStatus: CourseStatus; bestScore: number }>> {
  const courses = await prisma.course.findMany({
    where: { roadmapId, status: "PUBLISHED" },
    orderBy: { orderIndex: "asc" },
    select: { id: true, orderIndex: true, status: true },
  });

  const progresses = await prisma.courseProgress.findMany({
    where: {
      userId,
      courseId: { in: courses.map((c) => c.id) },
    },
    select: { courseId: true, status: true, bestScore: true },
  });

  const progressMap = new Map(
    progresses.map((p) => [
      p.courseId,
      { status: p.status as CourseStatus, bestScore: p.bestScore },
    ])
  );

  const states = computeRoadmapCourseStates(courses, progressMap);
  return new Map(
    states.map((s) => [
      s.courseId,
      { effectiveStatus: s.effectiveStatus, bestScore: s.bestScore },
    ])
  );
}
