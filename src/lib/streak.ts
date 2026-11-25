import type { ActivitySource, PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { shiftDateKey, toJakartaDateKey } from "@/lib/date";

/**
 * Computes the active daily streak (with grace until Jakarta midnight if yesterday was active).
 */
export function calculateCurrentStreak(
  dateKeys: string[],
  todayKey: string
): { currentStreak: number; activeToday: boolean } {
  const uniqueDays = new Set(dateKeys);
  const activeToday = uniqueDays.has(todayKey);
  const yesterdayKey = shiftDateKey(todayKey, -1);

  let cursor = activeToday
    ? todayKey
    : uniqueDays.has(yesterdayKey)
      ? yesterdayKey
      : null;

  if (!cursor) {
    return { currentStreak: 0, activeToday: false };
  }

  let currentStreak = 0;
  while (uniqueDays.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return { currentStreak, activeToday };
}

/**
 * Idempotently logs a study action for today's Jakarta dateKey without double-counting toggles.
 */
export async function recordStudyActivity(
  db: PrismaClient,
  input: {
    userId: string;
    sourceType: ActivitySource;
    sourceId: string;
    minutes?: number;
    now?: Date;
  }
): Promise<{ dateKey: string; recordedNew: boolean }> {
  const dateKey = toJakartaDateKey(input.now ?? new Date());
  const minutes = Math.max(0, input.minutes ?? 0);

  try {
    const recordedNew = await db.$transaction(async (tx) => {
      await tx.dailyActivityLog.create({
        data: {
          userId: input.userId,
          dateKey,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
        },
      });

      await tx.dailyActivity.upsert({
        where: {
          userId_dateKey: {
            userId: input.userId,
            dateKey,
          },
        },
        update: {
          activityCount: { increment: 1 },
          studyMinutes: { increment: minutes },
        },
        create: {
          userId: input.userId,
          dateKey,
          activityCount: 1,
          studyMinutes: minutes,
        },
      });

      return true;
    });

    return { dateKey, recordedNew };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { dateKey, recordedNew: false };
    }
    throw err;
  }
}
