import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const updateNoteSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  body: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1)).max(8).optional(),
  checklist: z
    .array(z.object({ text: z.string().trim().min(1), done: z.boolean() }))
    .nullable()
    .optional(),
  color: z.enum(["PINK", "BUTTER", "MINT", "LAV"]).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id } = await context.params;
    const data = updateNoteSchema.parse(await req.json());

    const result = await prisma.note.updateMany({
      where: { id, userId: student.userId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.body !== undefined ? { body: data.body } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.checklist !== undefined
          ? {
              checklist:
                data.checklist === null
                  ? Prisma.JsonNull
                  : (data.checklist as Prisma.InputJsonValue),
            }
          : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
      },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
    }
    const note = await prisma.note.findUnique({ where: { id } });
    return NextResponse.json({ note });
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
    await prisma.note.deleteMany({
      where: { id, userId: student.userId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
