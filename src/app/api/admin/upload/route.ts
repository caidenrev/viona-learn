import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { saveUploadedImage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    await requireRole("TEACHER");
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Berkas gambar tidak ditemukan." },
        { status: 400 }
      );
    }
    const result = await saveUploadedImage(file);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
