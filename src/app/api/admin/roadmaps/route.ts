import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const createRoadmapSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1),
  levelLabel: z.string().trim().min(1).max(60).optional(),
  targetDate: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export async function GET() {
  try {
    await requireRole("TEACHER");
    const roadmaps = await prisma.roadmap.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        courses: {
          orderBy: { orderIndex: "asc" },
          include: {
            _count: { select: { modules: true, quizQuestions: true } },
          },
        },
      },
    });
    return NextResponse.json({ roadmaps });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireRole("TEACHER");
    const data = createRoadmapSchema.parse(await req.json());
    const baseSlug = slugify(data.title) || "roadmap";
    const existing = await prisma.roadmap.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const roadmap = await prisma.roadmap.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        levelLabel: data.levelLabel ?? "Dasar - Mahir",
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: data.status ?? "DRAFT",
        orderIndex: data.orderIndex ?? 0,
      },
    });
    return NextResponse.json({ roadmap }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
