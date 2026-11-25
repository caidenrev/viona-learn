import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const updateModuleSchema = z.object({
  chapterTitle: z.string().trim().min(1).max(100).optional(),
  title: z.string().trim().min(1).max(160).optional(),
  orderIndex: z.number().int().min(0).optional(),
  contentJson: z.unknown().optional(),
  videoUrl: z.string().trim().nullable().optional(),
  attachments: z.unknown().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).max(300).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id } = await context.params;
    const data = updateModuleSchema.parse(await req.json());

    const updated = await prisma.module.update({
      where: { id },
      data: {
        ...(data.chapterTitle !== undefined ? { chapterTitle: data.chapterTitle } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.orderIndex !== undefined ? { orderIndex: data.orderIndex } : {}),
        ...(data.contentJson !== undefined
          ? { contentJson: data.contentJson as Prisma.InputJsonValue }
          : {}),
        ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl } : {}),
        ...(data.attachments !== undefined
          ? {
              attachments:
                data.attachments === null
                  ? Prisma.JsonNull
                  : (data.attachments as Prisma.InputJsonValue),
            }
          : {}),
        ...(data.estimatedMinutes !== undefined
          ? { estimatedMinutes: data.estimatedMinutes }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
    return NextResponse.json({ module: updated });
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
    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
