import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";
import { QuizError } from "@/lib/progression";
import { UploadValidationError } from "@/lib/storage";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof QuizError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof UploadValidationError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: err.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 }
    );
  }
  console.error(err);
  return NextResponse.json(
    { error: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}
