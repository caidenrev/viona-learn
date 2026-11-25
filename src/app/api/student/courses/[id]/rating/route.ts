import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  review: z.string().trim().max(500).optional(),
});

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireRole("STUDENT");
    const { id: courseId } = await context.params;
    const data = ratingSchema.parse(await req.json());

    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: { userId: student.userId, courseId },
      },
    });
    if (!progress || progress.status !== "PASSED") {
      return NextResponse.json(
        { error: "Lulus Mini Quiz dulu sebelum memberi rating course." },
        { status: 403 }
      );
    }

    const rating = await prisma.courseRating.upsert({
      where: {
        userId_courseId: { userId: student.userId, courseId },
      },
      update: {
        stars: data.stars,
        review: data.review ?? null,
      },
      create: {
        userId: student.userId,
        courseId,
        stars: data.stars,
        review: data.review ?? null,
      },
    });

    return NextResponse.json({ rating });
  } catch (err) {
    return handleApiError(err);
  }
}
