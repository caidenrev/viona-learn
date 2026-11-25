import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AuthError,
  hashPassword,
  requireRole,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isSupabaseAuthConfigured,
  updateSupabasePassword,
  verifySupabasePassword,
} from "@/lib/supabase";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const session = await requireRole();
    const json = await req.json();
    const parsed = passwordSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal 6 karakter." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    let valid = false;
    if (isSupabaseAuthConfigured() && user.email && user.supabaseAuthId) {
      const sbCheck = await verifySupabasePassword(
        user.email,
        parsed.data.currentPassword
      );
      valid = sbCheck.ok;
    } else {
      valid = await verifyPassword(
        parsed.data.currentPassword,
        user.passwordHash
      );
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Kata sandi saat ini tidak sesuai." },
        { status: 400 }
      );
    }

    if (isSupabaseAuthConfigured() && user.supabaseAuthId) {
      await updateSupabasePassword(user.supabaseAuthId, parsed.data.newPassword);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Gagal mengubah kata sandi." },
      { status: 500 }
    );
  }
}
