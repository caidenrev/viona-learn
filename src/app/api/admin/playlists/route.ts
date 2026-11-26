import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const createPlaylistSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().nullable().optional(),
  color: z.enum(["PINK", "BUTTER", "MINT", "LAV"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export async function GET() {
  try {
    await requireRole("TEACHER");
    const playlists = await prisma.playlist.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: { select: { roadmaps: true } },
      },
    });
    return NextResponse.json({ playlists });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireRole("TEACHER");
    const data = createPlaylistSchema.parse(await req.json());
    const baseSlug = slugify(data.title) || "playlist";
    const existing = await prisma.playlist.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const playlist = await prisma.playlist.create({
      data: {
        title: data.title,
        slug,
        description: data.description ?? null,
        color: data.color ?? "PINK",
        status: data.status ?? "PUBLISHED",
        orderIndex: data.orderIndex ?? 0,
      },
      include: {
        _count: { select: { roadmaps: true } },
      },
    });
    return NextResponse.json({ playlist }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
