import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const updatePlaylistSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().nullable().optional(),
  color: z.enum(["PINK", "BUTTER", "MINT", "LAV"]).optional(),
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
    const data = updatePlaylistSchema.parse(await req.json());

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.orderIndex !== undefined ? { orderIndex: data.orderIndex } : {}),
      },
      include: {
        _count: { select: { roadmaps: true } },
      },
    });
    return NextResponse.json({ playlist });
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
    await prisma.playlist.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
