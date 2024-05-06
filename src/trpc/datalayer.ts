import "server-only";

import { Temporal } from "@js-temporal/polyfill";
import { cache } from "react";
import * as z from "zod";
import { db, e, plainDate } from "~/edgedb";
import { protectedProcedure } from "./init";

export const getClients = cache(
  protectedProcedure.meta({ span: "getClients" }).query(async ({ ctx }) => {
    const clients = await e
      .select(e.Client, (client) => ({
        ...client["*"],
        periods: (period) => ({
          ...period["*"],
          timeslots: (ts) => ts["*"],
        }),
        filter: e.op(client.tenantId, "=", e.uuid(ctx.user.id)),
      }))
      .run(db);

    // FIXME: Would be nice to handle this in the db-driver
    return clients.map((client) => ({
      ...client,
      periods: client.periods.map((period) => ({
        ...period,
        startDate: Temporal.PlainDate.from(period.startDate),
        endDate: Temporal.PlainDate.from(period.endDate),
        timeslots: period.timeslots.map((timeslot) => ({
          ...timeslot,
          date: Temporal.PlainDate.from(timeslot.date),
        })),
      })),
    }));
  }),
);
export type Client = Awaited<ReturnType<typeof getClients>>[number];

export const getTimeslots = cache(
  protectedProcedure
    .meta({ span: "getTimeslots" })
    .input(
      z.object({
        date: z.instanceof(Temporal.PlainDate),
        mode: z.enum(["exact", "month"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { date, mode } = input;

      const range = [
        // to account for timeslots that start/end in the previous/next month
        // pad the month with a week on either side so it shows in the calendar
        // Could be more exact but should be fine...
        input.date.subtract({ days: date.day + 7 }),
        input.date.add({ days: date.daysInMonth - date.day + 7 }),
      ] as const;

      const slots = await e
        .select(e.Timeslot, (ts) => ({
          id: true,
          client: {
            id: true,
            name: true,
          },
          date: true,
          duration: true,
          description: true,
          chargeRate: true,
          currency: true,
          tenantId: true,

          filter: e.op(
            e.op(ts.tenantId, "=", e.uuid(ctx.user.id)),
            "and",
            mode === "exact"
              ? e.op(ts.date, "=", plainDate(date))
              : e.op(
                  e.op(ts.date, ">=", plainDate(range[0])),
                  "and",
                  e.op(ts.date, "<=", plainDate(range[1])),
                ),
          ),
        }))
        .run(db);

      // FIXME: Would be nice to handle this in the db-driver
      return slots.map((slot) => ({
        ...slot,
        date: Temporal.PlainDate.from(slot.date),
      }));
    }),
);
export type Timeslot = Awaited<ReturnType<typeof getTimeslots>>[number];

export const getOpenPeriods = cache(
  protectedProcedure.meta({ span: "getOpenPeriods" }).query(async ({ ctx }) => {
    const periods = await e
      .select(e.Period, (period) => ({
        ...period["*"],
        timeslots: (ts) => ts["*"],
        client: (client) => client["*"],
        filter: e.op(
          e.op(period.tenantId, "=", e.uuid(ctx.user.id)),
          "and",
          e.op(period.status, "=", e.PeriodStatus.open),
        ),
      }))
      .run(db);

    // FIXME: Would be nice to handle this in the db-driver
    return periods.map((period) => ({
      ...period,
      startDate: Temporal.PlainDate.from(period.startDate),
      endDate: Temporal.PlainDate.from(period.endDate),
      timeslots: period.timeslots.map((ts) => ({
        ...ts,
        date: Temporal.PlainDate.from(ts.date),
      })),
    }));
  }),
);
export type Period = Awaited<ReturnType<typeof getOpenPeriods>>[number];
