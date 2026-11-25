/**
 * Normalizes a WhatsApp phone number to international digits (62... for leading 0).
 */
export function normalizeWhatsappDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Builds the contextual "Tanya Husband" WhatsApp deep link.
 */
export function buildTanyaHusbandUrl(input: {
  phone: string;
  courseTitle: string;
  moduleTitle: string;
}): string {
  const normalized = normalizeWhatsappDigits(input.phone);
  const message = `Sayangg, ini gimana ya di bagian ${input.courseTitle} - ${input.moduleTitle}?`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
