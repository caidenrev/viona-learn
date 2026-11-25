import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import {
  getJakartaTodayKey,
  getMonthRange,
  toJakartaDateKey,
} from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const student = await requireRole("STUDENT");
    const { searchParams } = new URL(req.url);
    const monthParam =
      searchParams.get("month") ?? getJakartaTodayKey().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { error: "Format bulan harus YYYY-MM." },
        { status: 400 }
      );
    }

    const { start, end, startKey, endKey } = getMonthRange(monthParam);

    const [roadmaps, courses, tasks, activities] = await Promise.all([
      prisma.roadmap.findMany({
        where: {
          status: "PUBLISHED",
          targetDate: { gte: start, lte: end },
        },
        select: { id: true, title: true, slug: true, targetDate: true },
      }),
      prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          roadmap: { status: "PUBLISHED" },
          targetDate: { gte: start, lte: end },
        },
        select: { id: true, title: true, slug: true, targetDate: true },
      }),
      prisma.workspaceTask.findMany({
        where: {
          userId: student.userId,
          dueDate: { gte: start, lte: end },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          completed: true,
          category: true,
        },
      }),
      prisma.dailyActivity.findMany({
        where: {
          userId: student.userId,
          dateKey: { gte: startKey, lte: endKey },
        },
      }),
    ]);

    const events = [
      ...roadmaps
        .filter((r) => r.targetDate)
        .map((r) => ({
          id: `rm-${r.id}`,
          type: "ROADMAP_TARGET" as const,
          title: r.title,
          slug: r.slug,
          dateKey: toJakartaDateKey(r.targetDate!),
        })),
      ...courses
        .filter((c) => c.targetDate)
        .map((c) => ({
          id: `cs-${c.id}`,
          type: "COURSE_TARGET" as const,
          title: c.title,
          slug: c.slug,
          dateKey: toJakartaDateKey(c.targetDate!),
        })),
      ...tasks
        .filter((t) => t.dueDate)
        .map((t) => ({
          id: `tk-${t.id}`,
          type: "TASK_DUE" as const,
          title: t.title,
          completed: t.completed,
          category: t.category,
          dateKey: toJakartaDateKey(t.dueDate!),
        })),
    ];

    return NextResponse.json({
      month: monthParam,
      events,
      streakDays: activities.map((a) => ({
        dateKey: a.dateKey,
        activityCount: a.activityCount,
        studyMinutes: a.studyMinutes,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
