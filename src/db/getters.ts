import { endOfMonth, startOfMonth } from "date-fns";
import { and, between, eq } from "drizzle-orm";

import { currentUser } from "~/lib/auth";
import { db } from ".";
import { client, timeslot } from "./schema";

export const getClients = async () => {
  const user = await currentUser();
  if (!user) return [];

  const clients = await db
    .select({
      id: client.id,
      name: client.name,
      image: client.image,
      defaultCharge: client.defaultCharge,
      curr: client.currency,
      createdAt: client.createdAt,
    })
    .from(client)
    .where(eq(client.tenantId, user.id));

  return clients;
};
export type Client = Awaited<ReturnType<typeof getClients>>[number];

export const getTimeslots = async (
  date: Date,
  opts: { mode: "exact" | "month" },
) => {
  const user = await currentUser();
  if (!user) return [];

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
        eq(timeslot.tenantId, user.id),
        opts.mode === "exact"
          ? eq(timeslot.date, date)
          : between(timeslot.date, startOfMonth(date), endOfMonth(date)),
      ),
    );

  return slots;
};
export type Timeslot = Awaited<ReturnType<typeof getTimeslots>>[number];
