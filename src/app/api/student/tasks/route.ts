import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  dueDate: z.string().datetime().nullable().optional(),
  isTodayGoal: z.boolean().optional(),
  category: z.enum(["STUDY", "PERSONAL"]).optional(),
  courseId: z.string().nullable().optional(),
  moduleId: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const student = await requireRole("STUDENT");
    const tasks = await prisma.workspaceTask.findMany({
      where: { userId: student.userId },
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const student = await requireRole("STUDENT");
    const data = createTaskSchema.parse(await req.json());
    const task = await prisma.workspaceTask.create({
      data: {
        userId: student.userId,
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        isTodayGoal: data.isTodayGoal ?? true,
        category: data.category ?? "STUDY",
        courseId: data.courseId ?? null,
        moduleId: data.moduleId ?? null,
      },
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
