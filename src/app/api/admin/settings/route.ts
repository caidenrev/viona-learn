import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const patchSettingsSchema = z.object({
  teacherWhatsapp: z.string().trim().min(6).optional(),
  siteTitle: z.string().trim().min(1).max(60).optional(),
  resetStudentPassword: z.string().min(6).optional(),
});

export async function GET() {
  try {
    await requireRole("TEACHER");
    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
    });
    const student = await prisma.user.findUnique({
      where: { role: "STUDENT" },
      select: { id: true, username: true, name: true },
    });
    return NextResponse.json({ settings, student });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireRole("TEACHER");
    const parsed = patchSettingsSchema.parse(await req.json());

    let settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
    });

    if (parsed.teacherWhatsapp !== undefined || parsed.siteTitle !== undefined) {
      settings = await prisma.appSettings.upsert({
        where: { id: "default" },
        update: {
          ...(parsed.teacherWhatsapp !== undefined
            ? { teacherWhatsapp: parsed.teacherWhatsapp }
            : {}),
          ...(parsed.siteTitle !== undefined ? { siteTitle: parsed.siteTitle } : {}),
        },
        create: {
          id: "default",
          teacherWhatsapp: parsed.teacherWhatsapp ?? "6281234567890",
          siteTitle: parsed.siteTitle ?? "Belajar Yuk!",
        },
      });
    }

    if (parsed.resetStudentPassword) {
      await prisma.user.update({
        where: { role: "STUDENT" },
        data: { passwordHash: await hashPassword(parsed.resetStudentPassword) },
      });
    }

    return NextResponse.json({ settings, passwordReset: Boolean(parsed.resetStudentPassword) });
  } catch (err) {
    return handleApiError(err);
  }
}
