import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockUpdateUserById = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn((_url: string, key: string) => {
    if (key === "service-role-key") {
      return {
        storage: {
          from: () => ({
            upload: (...args: unknown[]) => mockUpload(...args),
            getPublicUrl: (...args: unknown[]) => mockGetPublicUrl(...args),
          }),
          getBucket: vi.fn().mockResolvedValue({ data: { name: "viona-media" }, error: null }),
          createBucket: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
        auth: {
          admin: {
            updateUserById: (...args: unknown[]) => mockUpdateUserById(...args),
          },
        },
      };
    }
    return {
      auth: {
        signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      },
    };
  }),
}));

describe("Supabase auth and storage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.SUPABASE_STORAGE_BUCKET = "viona-media";
  });

  it("uploads validated image to Supabase Storage when configured", async () => {
    mockUpload.mockResolvedValue({ data: { path: "uploads/test.png" }, error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://demo.supabase.co/storage/v1/object/public/viona-media/uploads/test.png" },
    });

    const { saveUploadedImage } = await import("@/lib/storage");
    const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([pngBytes], "thumb.png", { type: "image/png" });

    const result = await saveUploadedImage(file);
    expect(result.url).toBe(
      "https://demo.supabase.co/storage/v1/object/public/viona-media/uploads/test.png"
    );
    expect(mockUpload).toHaveBeenCalledTimes(1);
  });

  it("verifies and updates user passwords via Supabase Auth", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "sb-user-1" } },
      error: null,
    });
    mockUpdateUserById.mockResolvedValue({ data: { user: { id: "sb-user-1" } }, error: null });

    const { verifySupabasePassword, updateSupabasePassword } = await import(
      "@/lib/supabase"
    );
    const verified = await verifySupabasePassword("viona@viona-learn.local", "secret123");
    expect(verified).toEqual({ ok: true, supabaseAuthId: "sb-user-1" });

    await expect(
      updateSupabasePassword("sb-user-1", "new-secret-123")
    ).resolves.toBeUndefined();
    expect(mockUpdateUserById).toHaveBeenCalledWith("sb-user-1", {
      password: "new-secret-123",
    });
  });
});
