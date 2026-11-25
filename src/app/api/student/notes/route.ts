import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { getJakartaTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).max(8).optional(),
  checklist: z
    .array(z.object({ text: z.string().trim().min(1), done: z.boolean() }))
    .optional(),
  dateKey: z.string().optional(),
  courseId: z.string().nullable().optional(),
  color: z.enum(["PINK", "BUTTER", "MINT", "LAV"]).optional(),
});

export async function GET() {
  try {
    const student = await requireRole("STUDENT");
    const notes = await prisma.note.findMany({
      where: { userId: student.userId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ notes });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const student = await requireRole("STUDENT");
    const data = createNoteSchema.parse(await req.json());
    const note = await prisma.note.create({
      data: {
        userId: student.userId,
        title: data.title,
        body: data.body,
        tags: data.tags ?? [],
        checklist: data.checklist
          ? (data.checklist as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        dateKey: data.dateKey ?? getJakartaTodayKey(),
        courseId: data.courseId ?? null,
        color: data.color ?? "BUTTER",
      },
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
