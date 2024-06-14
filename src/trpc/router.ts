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
import { currencySchema, normalizeAmount } from "~/monetary/math";
import {
  closePeriodSchema,
  reportTimeSchema,
  updateSchema,
} from "~/app/(app)/report/[month]/_validators";
import {
  createClientSchema,
  updateClientSchema,
} from "~/app/(app)/clients/_validators";
import { deleteImageIfExists, utapi } from "~/uploadthing/server";

export const appRouter = router({
  /**
   * User Actions
   */
  setDefaultCurrency: protectedProcedure
    .input(currencySchema)
    .mutation(async ({ ctx, input }) => {
      await e
        .update(e.User, (user) => ({
          set: { defaultCurrency: input },
          filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
        }))
        .run(db);

      return { ok: true };
    }),

  updateDisplayName: protectedProcedure
    .input(z.string().min(1, "Name must be at least 1 character long"))
    .mutation(async ({ ctx, input }) => {
      await e
        .update(e.User, (user) => ({
          set: { name: input },
          filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
        }))
        .run(db);

      return { ok: true };
    }),

  updateUserImage: protectedProcedure
    .input(z.string().url())
    .mutation(async ({ ctx, input }) => {
      await e
        .update(e.User, (user) => ({
          set: { image: input },
          filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
        }))
        .run(db);

      return { ok: true };
    }),

  /**
   * Clients
   */
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

  addClient: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      const now = Temporal.Now.plainDateISO();
      const currentUser = e.select(e.User, (user) => ({
        filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
      }));

      const insertClient = e.insert(e.Client, {
        ...input,
        defaultCharge: normalizeAmount(input.defaultCharge, input.currency),
        tenant: currentUser,
      });

      await e
        .insert(e.Period, {
          client: insertClient,
          tenant: currentUser,
          startDate: plainDate(
            input.defaultBillingPeriod === "monthly"
              ? now.with({ day: 1 })
              : now.with({ day: now.day - now.dayOfWeek }),
          ),
          endDate: plainDate(
            input.defaultBillingPeriod === "monthly"
              ? now.with({ day: now.daysInMonth })
              : input.defaultBillingPeriod === "biweekly"
                ? now.add({ days: 13 - now.dayOfWeek })
                : now.add({ days: 6 - now.dayOfWeek }),
          ),
        })
        .run(db);
    }),

  updateClient: protectedProcedure
    .input(updateClientSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      await e
        .update(e.Client, (client) => ({
          set: {
            ...rest,
            defaultCharge: normalizeAmount(input.defaultCharge, input.currency),
          },
          filter_single: e.op(
            e.op(client.id, "=", e.uuid(id)),
            "and",
            e.op(client.tenant.id, "=", e.uuid(ctx.user.id)),
          ),
        }))
        .run(db);
    }),

  deleteClient: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await e
        .select(e.Client, (client) => ({
          id: true,
          image: true,
          filter_single: e.op(
            e.op(client.id, "=", e.uuid(input.id)),
            "and",
            e.op(client.tenant.id, "=", e.uuid(ctx.user.id)),
          ),
        }))
        .run(db);
      if (!existing) throw new Error("Unauthorized");

      await Promise.all([
        db.execute("delete Client filter .id = <uuid>$id", { id: input.id }),
        deleteImageIfExists(existing.image),
      ]);
    }),

  /**
   * Periods
   */
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

  closePeriod: protectedProcedure
    .input(closePeriodSchema)
    .mutation(async ({ ctx, input }) => {
      const res = await e
        .update(e.Period, (period) => ({
          set: { status: e.PeriodStatus.closed, closedAt: new Date() },
          filter_single: e.all(
            e.set(
              e.op(period.id, "=", e.uuid(input.id)),
              e.op(period.status, "=", e.PeriodStatus.open),
              e.op(period.tenant.id, "=", e.uuid(ctx.user.id)),
            ),
          ),
        }))
        .run(db);

      if (!res) {
        // Nothing changed meaning the period was already closed, or the user is not the owner
        throw new Error("Unauthorized");
      }

      if (input.openNewPeriod) {
        await e
          .insert(e.Period, {
            status: e.PeriodStatus.open,
            tenant: e.select(e.User, (user) => ({
              filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
            })),
            client: e.select(e.Client, (client) => ({
              filter_single: e.op(client.id, "=", e.uuid(input.clientId)),
            })),
            startDate: e.cal.local_date(input.periodStart),
            endDate: e.cal.local_date(input.periodEnd),
          })
          .run(db);
      }
    }),

  /**
   * Timeslots
   */
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

  reportTime: protectedProcedure
    .input(reportTimeSchema)
    .mutation(async ({ ctx, input }) => {
      const existingClient = await e
        .select(e.Client, (client) => ({
          filter: e.op(
            e.op(client.id, "=", e.uuid(input.clientId)),
            "and",
            e.op(client.tenant.id, "=", e.uuid(ctx.user.id)),
          ),
        }))
        .run(db);
      if (!existingClient) throw new Error("Unauthorized");

      const slotPeriod = await e
        .select(e.Period, (period) => ({
          filter_single: e.all(
            e.set(
              e.op(period.client.id, "=", e.uuid(input.clientId)),
              e.op(period.status, "=", e.PeriodStatus.open),
              e.op(period.tenant.id, "=", e.uuid(ctx.user.id)),
            ),
          ),
        }))
        .run(db);
      if (!slotPeriod) {
        // TODO: Create a new one
        throw new Error("No open period found");
      }

      console.log("Inserting timeslot for period", slotPeriod.id);

      await e
        .insert(e.Timeslot, {
          date: e.cal.local_date(input.date),
          duration: String(input.duration),
          chargeRate: normalizeAmount(input.chargeRate, input.currency),
          currency: input.currency,
          description: input.description,
          client: e.select(e.Client, (client) => ({
            filter_single: e.op(client.id, "=", e.uuid(input.clientId)),
          })),
          period: e.select(e.Period, (period) => ({
            filter_single: e.op(period.id, "=", e.uuid(slotPeriod.id)),
          })),
          tenant: e.select(e.User, (user) => ({
            filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
          })),
        })
        .run(db);
    }),

  updateTimeslot: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      await e
        .update(e.Timeslot, (timeslot) => ({
          set: {
            currency: input.currency,
            duration: String(input.duration),
            chargeRate: normalizeAmount(input.chargeRate, input.currency),
          },
          filter_single: e.op(
            e.op(timeslot.id, "=", e.uuid(input.id)),
            "and",
            e.op(timeslot.tenant.id, "=", e.uuid(ctx.user.id)),
          ),
        }))
        .run(db);
    }),

  deleteTimeslot: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await db.execute(
        "delete Timeslot filter .id = <uuid>$id and .tenant.id = <uuid>$tenantId",
        { id: input, tenantId: ctx.user.id },
      );
    }),

  /**
   * UploadThing
   */
  deleteImageFromUT: protectedProcedure
    .input(z.string().optional())
    .mutation(async ({ input }) => deleteImageIfExists(input)),
});

export type TRPCRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<TRPCRouter>;
export type RouterOutputs = inferRouterOutputs<TRPCRouter>;

export type Client = RouterOutputs["listClients"][number];
export type Timeslot = RouterOutputs["getTimeslots"][number];
export type Period = RouterOutputs["listPeriods"][number];
