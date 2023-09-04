import { cache } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { between, eq } from "drizzle-orm";

import { db } from ".";
import { client, timeslot } from "./schema";

export const getClients = cache(async () => {
  const clients = await db
    .select({
      id: client.id,
      name: client.name,
      image: client.image,
      defaultCharge: client.defaultCharge,
      curr: client.currency,
    })
    .from(client);

  return clients;
});
export type Client = Awaited<ReturnType<typeof getClients>>[number];

export const getTimeslots = cache(
  async (date: Date, opts: { mode: "exact" | "month" }) => {
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
        opts.mode === "exact"
          ? eq(timeslot.date, date)
          : between(timeslot.date, startOfMonth(date), endOfMonth(date)),
      );

    return slots;
  },
);
export type Timeslot = Awaited<ReturnType<typeof getTimeslots>>[number];
