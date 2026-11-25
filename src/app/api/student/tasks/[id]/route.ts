import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { recordStudyActivity } from "@/lib/streak";

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isTodayGoal: z.boolean().optional(),
  completed: z.boolean().optional(),
  category: z.enum(["STUDY", "PERSONAL"]).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id } = await context.params;
    const data = updateTaskSchema.parse(await req.json());

    const existing = await prisma.workspaceTask.findFirst({
      where: { id, userId: student.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.workspaceTask.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.dueDate !== undefined
          ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
          : {}),
        ...(data.isTodayGoal !== undefined ? { isTodayGoal: data.isTodayGoal } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.completed !== undefined
          ? {
              completed: data.completed,
              completedAt: data.completed ? new Date() : null,
            }
          : {}),
      },
    });

    if (data.completed === true && updated.category === "STUDY") {
      await recordStudyActivity(prisma, {
        userId: student.userId,
        sourceType: "STUDY_TASK",
        sourceId: updated.id,
        minutes: 10,
      });
    }

    return NextResponse.json({ task: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id } = await context.params;
    await prisma.workspaceTask.deleteMany({
      where: { id, userId: student.userId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
