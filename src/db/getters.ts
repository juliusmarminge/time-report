import { add, endOfMonth, startOfMonth, sub } from "date-fns";
import { and, between, eq } from "drizzle-orm";

import { db } from ".";
import { client, period, timeslot } from "./schema";

export const getClients = async (userId: string) => {
  const clients = await db.query.client.findMany({
    where: eq(client.tenantId, userId),
    with: {
      periods: {
        with: {
          timeslot: true,
        },
      },
    },
  });

  return clients;
};
export type Client = Awaited<ReturnType<typeof getClients>>[number];

export const getTimeslots = async (
  date: Date,
  userId: string,
  opts: { mode: "exact" | "month" },
) => {
  const slots = await db
    .select({
      id: timeslot.id,
      clientId: timeslot.clientId,
      clientName: client.name,
      date: timeslot.date,
      duration: timeslot.duration,
      description: timeslot.description,
      chargeRate: timeslot.chargeRate,
      currency: timeslot.currency,
    })
    .from(timeslot)
    .innerJoin(client, eq(client.id, timeslot.clientId))
    .where(
      and(
        eq(timeslot.tenantId, userId),
        opts.mode === "exact"
          ? eq(timeslot.date, date)
          : between(
              timeslot.date,
              // pad the month with a week on either side
              // to account for timeslots that start/end in the previous/next month
              sub(startOfMonth(date), { days: 6 }),
              add(endOfMonth(date), { days: 6 }),
            ),
      ),
    );

  return slots;
};
export type Timeslot = Awaited<ReturnType<typeof getTimeslots>>[number];

export const getOpenPeriods = async (userId: string) => {
  const periods = await db.query.period.findMany({
    where: and(eq(period.tenantId, userId), eq(period.status, "open")),
    with: {
      client: true,
      timeslot: true,
    },
  });

  return periods;
};
export type Period = Awaited<ReturnType<typeof getOpenPeriods>>[number];
