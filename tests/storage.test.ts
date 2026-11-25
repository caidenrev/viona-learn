import { describe, it, expect } from "vitest";
import { validateImageBuffer, UploadValidationError } from "@/lib/storage";

describe("upload image validation", () => {
  it("accepts valid PNG, JPEG, and WEBP magic bytes within 5 MB", () => {
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(validateImageBuffer({ bytes: png, mimeType: "image/png" })).toEqual({
      ext: "png",
    });

    const jpg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(validateImageBuffer({ bytes: jpg, mimeType: "image/jpeg" })).toEqual({
      ext: "jpg",
    });

    const webp = Uint8Array.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(validateImageBuffer({ bytes: webp, mimeType: "image/webp" })).toEqual({
      ext: "webp",
    });
  });

  it("rejects spoofed non-image files and files larger than 5 MB", () => {
    const fakePng = new TextEncoder().encode("not really a png");
    expect(() =>
      validateImageBuffer({ bytes: fakePng, mimeType: "image/png" })
    ).toThrowError(UploadValidationError);

    const huge = new Uint8Array(5 * 1024 * 1024 + 1);
    huge.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(() =>
      validateImageBuffer({ bytes: huge, mimeType: "image/png" })
    ).toThrowError(UploadValidationError);
  });
});
