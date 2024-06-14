import "server-only";

import { Temporal } from "@js-temporal/polyfill";
import * as z from "zod";
import { db, e, plainDate } from "~/edgedb";
import { protectedProcedure, router } from "./init";
import {
  TRPCError,
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server";

export const appRouter = router({
  listClients: protectedProcedure.query(async ({ ctx }) => {
    const clients = await e
      .select(e.Client, (client) => ({
        ...client["*"],
        periods: (period) => ({
          ...period["*"],
          timeslots: (ts) => ts["*"],
        }),
        filter: e.op(client.tenant.id, "=", e.uuid(ctx.user.id)),
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

  getTimeslots: protectedProcedure
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
            e.op(ts.tenant.id, "=", e.uuid(ctx.user.id)),
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

  getPeriod: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const period = await e
        .select(e.Period, (period) => ({
          ...period["*"],
          timeslots: (ts) => ts["*"],
          client: (client) => client["*"],
          filter_single: e.op(
            e.op(period.tenant.id, "=", e.uuid(ctx.user.id)),
            "and",
            e.op(period.id, "=", e.uuid(input.id)),
          ),
        }))
        .run(db);

      if (!period) return null;

      // FIXME: Would be nice to handle this in the db-driver
      return {
        ...period,
        startDate: Temporal.PlainDate.from(period.startDate),
        endDate: Temporal.PlainDate.from(period.endDate),
        timeslots: period.timeslots.map((ts) => ({
          ...ts,
          date: Temporal.PlainDate.from(ts.date),
        })),
      };
    }),

  listPeriods: protectedProcedure
    .input(z.object({ filter: z.enum(["open", "recently-closed"]) }))
    .query(async ({ ctx, input }) => {
      const periods = await e
        .select(e.Period, (period) => ({
          ...period["*"],
          timeslots: (ts) => ts["*"],
          client: (client) => client["*"],
          filter: e.all(
            e.set(
              e.op(period.tenant.id, "=", e.uuid(ctx.user.id)),
              ...(input.filter === "open"
                ? [
                    e.op(period.tenant.id, "=", e.uuid(ctx.user.id)),
                    e.op(period.status, "=", e.PeriodStatus.open),
                  ]
                : [
                    e.op(period.status, "=", e.PeriodStatus.closed),
                    e.op(
                      period.endDate,
                      "<",
                      plainDate(Temporal.Now.plainDateISO()),
                    ),
                  ]),
            ),
          ),
          ...(input.filter === "recently-closed"
            ? {
                limit: 5,
                order_by: { expression: period.endDate, direction: e.DESC },
              }
            : {}),
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
});

export type TRPCRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<TRPCRouter>;
export type RouterOutputs = inferRouterOutputs<TRPCRouter>;

export type Client = RouterOutputs["listClients"][number];
export type Timeslot = RouterOutputs["getTimeslots"][number];
export type Period = RouterOutputs["listPeriods"][number];
