const JAKARTA_TIMEZONE = "Asia/Jakarta";

const jakartaFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAKARTA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Converts a Date into a YYYY-MM-DD key in Asia/Jakarta (UTC+7).
 */
export function toJakartaDateKey(date: Date = new Date()): string {
  return jakartaFormatter.format(date);
}

/**
 * Returns today's YYYY-MM-DD key in Asia/Jakarta.
 */
export function getJakartaTodayKey(): string {
  return toJakartaDateKey(new Date());
}

/**
 * Shifts a YYYY-MM-DD dateKey by deltaDays calendar days.
 */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day + deltaDays);
  const shifted = new Date(utc);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes inclusive Jakarta-timezone Date bounds for a YYYY-MM month key.
 */
export function getMonthRange(monthKey: string): {
  start: Date;
  end: Date;
  startKey: string;
  endKey: string;
} {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, "0");
  const ddEnd = String(lastDay).padStart(2, "0");
  const startKey = `${year}-${mm}-01`;
  const endKey = `${year}-${mm}-${ddEnd}`;

  // Midnight and 23:59:59.999 in Asia/Jakarta (+07:00)
  const start = new Date(`${startKey}T00:00:00.000+07:00`);
  const end = new Date(`${endKey}T23:59:59.999+07:00`);
  return { start, end, startKey, endKey };
}
