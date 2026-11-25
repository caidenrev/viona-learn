import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  status: z.enum(["REVIEWED", "REVISION"]),
  score: z.number().int().min(0).max(100),
  rubricJson: z
    .array(
      z.object({
        criterion: z.string().trim().min(1),
        weight: z.number().int().min(0).max(100),
        score: z.number().int().min(0).max(100),
        maxScore: z.number().int().min(1).max(100),
        note: z.string().trim().optional(),
      })
    )
    .optional(),
  mentorFeedback: z.string().trim().min(1),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id } = await context.params;
    const data = reviewSchema.parse(await req.json());

    const submission = await prisma.courseSubmission.update({
      where: { id },
      data: {
        status: data.status,
        score: data.score,
        rubricJson: data.rubricJson
          ? (data.rubricJson as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        mentorFeedback: data.mentorFeedback,
      },
    });
    return NextResponse.json({ submission });
  } catch (err) {
    return handleApiError(err);
  }
}
