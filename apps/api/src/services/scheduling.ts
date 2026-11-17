import { prisma } from "../lib/prisma";

const WORKDAY_START_HOUR = 9;
const WORKDAY_END_HOUR = 17;
const SLOT_MINUTES = 45;

export interface Slot {
  start: string;
  end: string;
}

/** Returns bookable slots for an employer on a given day, excluding existing interviews. */
export async function findOpenSlots(employerId: string, day: Date): Promise<Slot[]> {
  const dayStart = new Date(day);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);

  const booked = await prisma.interview.findMany({
    where: {
      startsAt: { gte: dayStart, lt: dayEnd },
      status: { in: ["PROPOSED", "CONFIRMED"] },
      application: { job: { employerId } },
    },
  });

  const slots: Slot[] = [];
  for (let h = WORKDAY_START_HOUR * 60; h + SLOT_MINUTES <= WORKDAY_END_HOUR * 60; h += SLOT_MINUTES) {
    const start = new Date(dayStart.getTime() + h * 60_000);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);
    const clash = booked.some((b) => {
      const bEnd = new Date(b.startsAt.getTime() + b.durationMinutes * 60_000);
      return start < bEnd && end > b.startsAt;
    });
    if (!clash) slots.push({ start: start.toISOString(), end: end.toISOString() });
  }
  return slots;
}
