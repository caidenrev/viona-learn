import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  nickname: z.string().trim().min(1).max(40).optional(),
  dreamTarget: z.string().trim().max(120).nullable().optional(),
  bio: z.string().trim().max(300).nullable().optional(),
  focusWindow: z.string().trim().max(60).nullable().optional(),
  avatarUrl: z.string().trim().nullable().optional(),
});

export async function PATCH(req: Request) {
  try {
    const student = await requireRole("STUDENT");
    const data = updateProfileSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: student.userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.nickname !== undefined ? { nickname: data.nickname } : {}),
        ...(data.dreamTarget !== undefined ? { dreamTarget: data.dreamTarget } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.focusWindow !== undefined ? { focusWindow: data.focusWindow } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
      select: {
        id: true,
        username: true,
        name: true,
        nickname: true,
        dreamTarget: true,
        bio: true,
        focusWindow: true,
        role: true,
        avatarUrl: true,
      },
    });
    return NextResponse.json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
