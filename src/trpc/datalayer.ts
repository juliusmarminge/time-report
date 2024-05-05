import "server-only";

import { Temporal } from "@js-temporal/polyfill";
import { cache } from "react";
import * as z from "zod";
import { e, edgedb } from "~/edgedb";
import { fromDate, toDate } from "~/lib/temporal";
import { protectedProcedure } from "./init";

export const getClients = cache(
  protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const clients = await e
      .select(e.Client, (client) => ({
        ...client["*"],
        periods: (period) => ({
          ...period["*"],
          timeslots: (timeslot) => ({
            ...timeslot["*"],
          }),
        }),
        filter: e.op(client.tenantId, "=", e.uuid(userId)),
      }))
      .run(edgedb);

    console.log("raw client", clients);

    return clients.map((client) => ({
      ...client,
      periods: client.periods.map((period) => ({
        ...period,
        startDate: fromDate(period.startDate),
        endDate: fromDate(period.endDate),
        timeslots: period.timeslots.map((timeslot) => ({
          ...timeslot,
          date: fromDate(timeslot.date),
        })),
      })),
    }));
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

      const range = [
        // to account for timeslots that start/end in the previous/next month
        // pad the month with a week on either side
        toDate(input.date.subtract({ days: date.day + 7 })),
        toDate(input.date.add({ days: date.daysInMonth - date.day + 7 })),
      ] as const;

      const _slots = await e
        .select(e.Timeslot, (timeslot) => ({
          id: true,
          appId: true,
          client: () => ({
            id: true,
            name: true,
          }),
          date: true,
          duration: true,
          description: true,
          chargeRate: true,
          currency: true,
          tenantId: true,

          filter: e.op(
            e.op(timeslot.tenantId, "=", e.uuid(userId)),
            "and",
            mode === "exact"
              ? e.op(timeslot.date, "=", toDate(date))
              : e.op(
                  e.op(timeslot.date, ">=", range[0]),
                  "and",
                  e.op(timeslot.date, "<=", range[1]),
                ),
          ),
        }))
        .run(edgedb);

      return _slots.map((slot) => ({
        ...slot,
        date: fromDate(slot.date),
      }));
    }),
);
export type Timeslot = Awaited<ReturnType<typeof getTimeslots>>[number];

export const getOpenPeriods = cache(
  protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const _periods = await e
      .select(e.Period, (period) => ({
        ...period["*"],
        timeslots: e.Timeslot["*"],
        client: e.Client["*"],
        filter: e.op(
          e.op(period.tenantId, "=", e.uuid(userId)),
          "and",
          e.op(period.status, "=", e.PeriodStatus.open),
        ),
      }))
      .run(edgedb);

    return _periods.map((period) => ({
      ...period,
      startDate: fromDate(period.startDate),
      endDate: fromDate(period.endDate),
      timeslots: period.timeslots.map((timeslot) => ({
        ...timeslot,
        date: fromDate(timeslot.date),
      })),
    }));
  }),
);
export type Period = Awaited<ReturnType<typeof getOpenPeriods>>[number];
