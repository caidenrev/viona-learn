import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  isSupabaseStorageConfigured,
  uploadToSupabaseStorage,
} from "@/lib/supabase";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export class UploadValidationError extends Error {
  status = 400 as const;
}

function detectImageExt(bytes: Uint8Array): "png" | "jpg" | "webp" | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

const MIME_TO_EXT: Record<string, "png" | "jpg" | "webp"> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Validates image MIME allowlist, magic bytes signature, and file size cap.
 */
export function validateImageBuffer(input: {
  bytes: Uint8Array;
  mimeType: string;
  maxBytes?: number;
}): { ext: "png" | "jpg" | "webp" } {
  const maxBytes = input.maxBytes ?? DEFAULT_MAX_BYTES;
  if (input.bytes.byteLength === 0 || input.bytes.byteLength > maxBytes) {
    throw new UploadValidationError(
      "Ukuran gambar harus antara 1 byte hingga 5 MB."
    );
  }

  const declaredExt = MIME_TO_EXT[input.mimeType];
  if (!declaredExt) {
    throw new UploadValidationError(
      "Format gambar harus PNG, JPEG, atau WEBP."
    );
  }

  const detectedExt = detectImageExt(input.bytes);
  if (!detectedExt || detectedExt !== declaredExt) {
    throw new UploadValidationError(
      "Isi berkas gambar tidak cocok dengan tipe MIME."
    );
  }

  return { ext: detectedExt };
}

/**
 * Saves a validated image upload to Supabase Storage when configured,
 * falling back to local public/uploads/ for local/offline dev.
 */
export async function saveUploadedImage(file: File): Promise<{ url: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { ext } = validateImageBuffer({ bytes, mimeType: file.type });

  if (isSupabaseStorageConfigured()) {
    return uploadToSupabaseStorage({
      bytes,
      ext,
      mimeType: file.type,
    });
  }

  const fileName = `${crypto.randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), bytes);
  return { url: `/uploads/${fileName}` };
}
