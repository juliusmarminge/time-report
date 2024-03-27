import "server-only";

import { Temporal } from "@js-temporal/polyfill";
import { and, between, eq } from "drizzle-orm";
import { cache } from "react";
import * as z from "zod";
import { db } from "~/db/client";
import { client, period, timeslot } from "~/db/schema";
import { protectedProcedure } from "./init";

export const getClients = cache(
  protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

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
  }),
);
export type Client = Awaited<ReturnType<typeof getClients>>[number];

export const getTimeslots = cache(
  protectedProcedure
    .input(
      z.object({
        date: z.instanceof(Temporal.PlainDate),
        mode: z.enum(["exact", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { date, mode } = input;
      const userId = ctx.user.id;

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
            mode === "exact"
              ? eq(timeslot.date, input.date)
              : between(
                  timeslot.date,
                  // to account for timeslots that start/end in the previous/next month
                  // pad the month with a week on either side
                  date.subtract({ days: date.day + 7 }),
                  date.add({ days: date.daysInMonth - date.day + 7 }),
                ),
          ),
        );

      return slots;
    }),
);
export type Timeslot = Awaited<ReturnType<typeof getTimeslots>>[number];

export const getOpenPeriods = cache(
  protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const periods = await db.query.period.findMany({
      where: and(eq(period.tenantId, userId), eq(period.status, "open")),
      with: {
        client: true,
        timeslot: true,
      },
    });

    return periods;
  }),
);
export type Period = Awaited<ReturnType<typeof getOpenPeriods>>[number];
