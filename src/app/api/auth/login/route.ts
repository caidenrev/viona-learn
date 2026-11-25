import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth";
import {
  isSupabaseAuthConfigured,
  verifySupabasePassword,
} from "@/lib/supabase";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Username dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const identifier = parsed.data.username;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Username atau kata sandi salah." },
        { status: 401 }
      );
    }

    let valid = false;
    if (isSupabaseAuthConfigured() && user.email) {
      const sbResult = await verifySupabasePassword(
        user.email,
        parsed.data.password
      );
      valid = sbResult.ok;
      if (sbResult.ok && !user.supabaseAuthId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { supabaseAuthId: sbResult.supabaseAuthId },
        });
      }
    } else {
      valid = await verifyPassword(parsed.data.password, user.passwordHash);
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Username atau kata sandi salah." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    } as const;

    const token = await signSessionToken(sessionPayload);
    const res = NextResponse.json({ user: sessionPayload });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat masuk." },
      { status: 500 }
    );
  }
}
