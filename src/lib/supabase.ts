import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseAnonClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be configured.");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function verifySupabasePassword(
  email: string,
  password: string
): Promise<{ ok: true; supabaseAuthId: string } | { ok: false }> {
  const client = getSupabaseAnonClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { ok: false };
  }
  return { ok: true, supabaseAuthId: data.user.id };
}

export async function updateSupabasePassword(
  supabaseAuthId: string,
  newPassword: string
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(supabaseAuthId, {
    password: newPassword,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function ensureSupabaseAuthUser(input: {
  email: string;
  password: string;
  role: "TEACHER" | "STUDENT";
  name: string;
}): Promise<string> {
  const admin = getSupabaseAdminClient();
  const created = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: input.role },
    user_metadata: { name: input.name },
  });

  if (!created.error && created.data.user) {
    return created.data.user.id;
  }

  // If user already exists in Supabase Auth, look up ID without overwriting live password
  const listed = await admin.auth.admin.listUsers({ perPage: 100 });
  const existing = listed.data?.users.find(
    (u) => u.email?.toLowerCase() === input.email.toLowerCase()
  );
  if (existing) {
    return existing.id;
  }

  throw new Error(
    created.error?.message ?? "Gagal membuat atau menemukan user di Supabase Auth."
  );
}

export async function uploadToSupabaseStorage(input: {
  bytes: Uint8Array;
  ext: "png" | "jpg" | "webp";
  mimeType: string;
}): Promise<{ url: string }> {
  const admin = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "viona-media";

  const bucketCheck = await admin.storage.getBucket(bucket);
  if (bucketCheck.error) {
    await admin.storage.createBucket(bucket, { public: true });
  }

  const objectPath = `uploads/${crypto.randomUUID()}.${input.ext}`;
  const { error } = await admin.storage
    .from(bucket)
    .upload(objectPath, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload gagal: ${error.message}`);
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(objectPath);
  return { url: data.publicUrl };
}
