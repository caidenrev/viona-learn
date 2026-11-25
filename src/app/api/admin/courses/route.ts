import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const createCourseSchema = z.object({
  roadmapId: z.string().min(1),
  title: z.string().trim().min(1).max(140),
  summary: z.string().trim().min(1),
  thumbnailUrl: z.string().trim().nullable().optional(),
  targetDate: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  orderIndex: z.number().int().min(0).optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  hasPracticeTask: z.boolean().optional(),
  practicePrompt: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  try {
    await requireRole("TEACHER");
    const data = createCourseSchema.parse(await req.json());
    const baseSlug = slugify(data.title) || "course";
    const existing = await prisma.course.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const course = await prisma.course.create({
      data: {
        roadmapId: data.roadmapId,
        title: data.title,
        slug,
        summary: data.summary,
        thumbnailUrl: data.thumbnailUrl ?? null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: data.status ?? "DRAFT",
        orderIndex: data.orderIndex ?? 0,
        passingScore: data.passingScore ?? 70,
        hasPracticeTask: data.hasPracticeTask ?? false,
        practicePrompt: data.practicePrompt ?? null,
      },
    });
    return NextResponse.json({ course }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
