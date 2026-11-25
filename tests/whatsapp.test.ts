import { describe, it, expect } from "vitest";
import { normalizeWhatsappDigits, buildTanyaHusbandUrl } from "@/lib/whatsapp";

describe("Tanya Husband WhatsApp helper", () => {
  it("normalizes local Indonesian numbers to 62 format", () => {
    expect(normalizeWhatsappDigits("0812-3456-7890")).toBe("6281234567890");
    expect(normalizeWhatsappDigits("+62 812 3456 7890")).toBe("6281234567890");
    expect(normalizeWhatsappDigits("6281234567890")).toBe("6281234567890");
  });

  it("builds dynamic wa.me URL with course and module context", () => {
    const url = buildTanyaHusbandUrl({
      phone: "081234567890",
      courseTitle: "React & State",
      moduleTitle: "3.2 Memahami useEffect",
    });
    expect(url.startsWith("https://wa.me/6281234567890?text=")).toBe(true);
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toBe(
      "Sayangg, ini gimana ya di bagian React & State - 3.2 Memahami useEffect?"
    );
  });
});
