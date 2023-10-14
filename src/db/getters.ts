import { endOfMonth, startOfMonth } from "date-fns";
import { and, between, eq } from "drizzle-orm";

import { db } from ".";
import { client, period, timeslot } from "./schema";

export const getClients = async (userId: string) => {
  const clients = await db
    .select({
      id: client.id,
      name: client.name,
      image: client.image,
      defaultCharge: client.defaultCharge,
      defaultBillingPeriod: client.defaultBillingPeriod,
      curr: client.currency,
      createdAt: client.createdAt,
    })
    .from(client)
    .where(eq(client.tenantId, userId));

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
          : between(timeslot.date, startOfMonth(date), endOfMonth(date)),
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
