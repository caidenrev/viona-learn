import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const quizBuilderSchema = z.object({
  passingScore: z.number().int().min(1).max(100),
  questions: z.array(
    z.object({
      prompt: z.string().trim().min(1),
      options: z
        .array(
          z.object({
            id: z.string().trim().min(1),
            text: z.string().trim().min(1),
          })
        )
        .min(2),
      correctOptionId: z.string().trim().min(1),
      explanation: z.string().trim().nullable().optional(),
    })
  ),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id: courseId } = await context.params;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        passingScore: true,
        quizQuestions: { orderBy: { orderIndex: "asc" } },
      },
    });
    if (!course) {
      return NextResponse.json({ error: "Course tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({
      passingScore: course.passingScore,
      questions: course.quizQuestions,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("TEACHER");
    const { id: courseId } = await context.params;
    const data = quizBuilderSchema.parse(await req.json());

    for (const q of data.questions) {
      if (!q.options.some((opt) => opt.id === q.correctOptionId)) {
        return NextResponse.json(
          { error: "Setiap soal harus memiliki jawaban benar yang valid." },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.course.update({
        where: { id: courseId },
        data: { passingScore: data.passingScore },
      });

      await tx.quizQuestion.deleteMany({ where: { courseId } });

      if (data.questions.length > 0) {
        await tx.quizQuestion.createMany({
          data: data.questions.map((q, idx) => ({
            courseId,
            prompt: q.prompt,
            options: q.options,
            correctOptionId: q.correctOptionId,
            explanation: q.explanation ?? null,
            orderIndex: idx + 1,
          })),
        });
      }
    });

    const saved = await prisma.quizQuestion.findMany({
      where: { courseId },
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json({
      passingScore: data.passingScore,
      questions: saved,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
