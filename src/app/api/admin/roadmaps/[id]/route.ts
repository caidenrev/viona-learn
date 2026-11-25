import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const updateRoadmapSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).optional(),
  levelLabel: z.string().trim().min(1).max(60).optional(),
  targetDate: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id } = await context.params;
    const data = updateRoadmapSchema.parse(await req.json());

    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.levelLabel !== undefined ? { levelLabel: data.levelLabel } : {}),
        ...(data.targetDate !== undefined
          ? { targetDate: data.targetDate ? new Date(data.targetDate) : null }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.orderIndex !== undefined ? { orderIndex: data.orderIndex } : {}),
      },
    });
    return NextResponse.json({ roadmap });
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
    await prisma.roadmap.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
