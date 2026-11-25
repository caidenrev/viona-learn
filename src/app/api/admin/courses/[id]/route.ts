import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const updateCourseSchema = z.object({
  title: z.string().trim().min(1).max(140).optional(),
  summary: z.string().trim().min(1).optional(),
  thumbnailUrl: z.string().trim().nullable().optional(),
  targetDate: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  orderIndex: z.number().int().min(0).optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  hasPracticeTask: z.boolean().optional(),
  practicePrompt: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id } = await context.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        roadmap: { select: { id: true, title: true, slug: true } },
        modules: { orderBy: { orderIndex: "asc" } },
        quizQuestions: { orderBy: { orderIndex: "asc" } },
      },
    });
    if (!course) {
      return NextResponse.json({ error: "Course tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id } = await context.params;
    const data = updateCourseSchema.parse(await req.json());

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.summary !== undefined ? { summary: data.summary } : {}),
        ...(data.thumbnailUrl !== undefined ? { thumbnailUrl: data.thumbnailUrl } : {}),
        ...(data.targetDate !== undefined
          ? { targetDate: data.targetDate ? new Date(data.targetDate) : null }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.orderIndex !== undefined ? { orderIndex: data.orderIndex } : {}),
        ...(data.passingScore !== undefined ? { passingScore: data.passingScore } : {}),
        ...(data.hasPracticeTask !== undefined
          ? { hasPracticeTask: data.hasPracticeTask }
          : {}),
        ...(data.practicePrompt !== undefined
          ? { practicePrompt: data.practicePrompt }
          : {}),
      },
    });
    return NextResponse.json({ course });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id } = await context.params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
