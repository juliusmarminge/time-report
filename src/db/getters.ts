import { unstable_cache } from "next/cache";
import { endOfMonth, startOfMonth } from "date-fns";
import { and, between, eq } from "drizzle-orm";

import { db } from ".";
import { client, timeslot } from "./schema";

export const getClientsForUser = unstable_cache(
  async (userId: string) => {
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
      .where(eq(client.tenantId, userId));

    return clients;
  },
  undefined,
  { tags: ["clients"] },
);
export type Client = Awaited<ReturnType<typeof getClientsForUser>>[number];

export const getTimeslots = unstable_cache(
  async (date: Date, opts: { mode: "exact" | "month"; userId: string }) => {
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
          eq(timeslot.tenantId, opts.userId),
          opts.mode === "exact"
            ? eq(timeslot.date, date)
            : between(timeslot.date, startOfMonth(date), endOfMonth(date)),
        ),
      );

    return slots;
  },
  undefined,
  { tags: ["timeslots"] },
);
export type Timeslot = Awaited<ReturnType<typeof getTimeslots>>[number];
