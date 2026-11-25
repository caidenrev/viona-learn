import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const createPrivateNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1),
});

export async function GET() {
  try {
    const teacher = await requireRole("TEACHER");
    const notes = await prisma.mentorPrivateNote.findMany({
      where: { authorId: teacher.userId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ notes });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const teacher = await requireRole("TEACHER");
    const data = createPrivateNoteSchema.parse(await req.json());
    const note = await prisma.mentorPrivateNote.create({
      data: {
        authorId: teacher.userId,
        title: data.title,
        body: data.body,
      },
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const teacher = await requireRole("TEACHER");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID catatan wajib ada." }, { status: 400 });
    }
    await prisma.mentorPrivateNote.deleteMany({
      where: { id, authorId: teacher.userId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
