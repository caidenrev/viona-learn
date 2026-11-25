import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const createModuleSchema = z.object({
  chapterTitle: z.string().trim().min(1).max(100).optional(),
  title: z.string().trim().min(1).max(160),
  orderIndex: z.number().int().min(0).optional(),
  contentJson: z.unknown(),
  videoUrl: z.string().trim().nullable().optional(),
  attachments: z.unknown().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).max(300).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id: courseId } = await context.params;
    const data = createModuleSchema.parse(await req.json());

    const created = await prisma.module.create({
      data: {
        courseId,
        chapterTitle: data.chapterTitle ?? "Bab 1",
        title: data.title,
        orderIndex: data.orderIndex ?? 0,
        contentJson: (data.contentJson ?? { type: "doc", content: [] }) as Prisma.InputJsonValue,
        videoUrl: data.videoUrl ?? null,
        attachments:
          data.attachments !== undefined && data.attachments !== null
            ? (data.attachments as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        estimatedMinutes: data.estimatedMinutes ?? 10,
        status: data.status ?? "DRAFT",
      },
    });
    return NextResponse.json({ module: created }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
