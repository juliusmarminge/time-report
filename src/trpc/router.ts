import { endOfMonth, startOfMonth } from "date-fns";
import { and, between, eq } from "drizzle-orm";
import { utapi } from "uploadthing/server";
import { date, number, object, optional, string } from "valibot";

import { db } from "~/db";
import { client, timeslot } from "~/db/schema";
import type { CurrencyCode } from "~/lib/currencies";
import { currencies } from "~/lib/currencies";
import {
  createClientSchema,
  reportTimeSchema,
  updateClientSchema,
  updateTimeslotSchema,
} from "~/lib/validators";
import { createRouter, procedure } from "./init";

export const router = createRouter({
  /**
   * CLIENTS
   */
  createClient: procedure.input(createClientSchema).mutation(async (opts) => {
    const currency = opts.input.currency
      ? currencies[opts.input.currency as CurrencyCode]
      : currencies.USD;
    const normalizedAmount =
      opts.input.defaultCharge * currency.base ** currency.exponent;

    await db.insert(client).values({
      name: opts.input.name,
      currency: opts.input.currency as CurrencyCode,
      defaultCharge: normalizedAmount,
      image: opts.input.image,
      tenantId: opts.ctx.userId,
    });
  }),
  deleteClient: procedure.input(number()).mutation(async (opts) => {
    await db.delete(client).where(eq(client.id, opts.input));
  }),
  getClientsForUser: procedure
    .input(
      object({
        userId: string(),
      }),
    )
    .query(async (opts) => {
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
        .where(eq(client.tenantId, opts.input.userId));

      return clients;
    }),
  updateClient: procedure.input(updateClientSchema).mutation(async (opts) => {
    const currency = opts.input.currency
      ? currencies[opts.input.currency as CurrencyCode]
      : currencies.USD;
    const normalizedAmount =
      opts.input.defaultCharge * currency.base ** currency.exponent;

    await db
      .update(client)
      .set({
        name: opts.input.name,
        currency: opts.input.currency as CurrencyCode,
        defaultCharge: normalizedAmount,
      })
      .where(eq(client.id, opts.input.clientId));
  }),
  deleteImageFromUT: procedure
    .input(optional(string()))
    .mutation(async (opts) => {
      const imageKey = opts.input?.split("/f/")[1];
      if (imageKey) {
        await utapi.deleteFiles([imageKey]);
      }
    }),

  /**
   * TIMESLOTS
   */
  createTimeslot: procedure.input(reportTimeSchema).mutation(async (opts) => {
    const currency = opts.input.currency
      ? currencies[opts.input.currency as CurrencyCode]
      : currencies.USD;
    const normalizedAmount =
      opts.input.chargeRate * currency.base ** currency.exponent;

    await db.insert(timeslot).values({
      date: opts.input.date,
      duration: String(opts.input.duration),
      chargeRate: normalizedAmount,
      currency: opts.input.currency as CurrencyCode,
      description: opts.input.description,
      clientId: opts.input.clientId,
      tenantId: opts.ctx.userId,
    });
  }),
  deleteTimeslot: procedure.input(number()).mutation(async (opts) => {
    await db.delete(timeslot).where(eq(timeslot.id, opts.input));
  }),
  getTimeslots: procedure
    .input(
      object({
        date: date(),
        mode: string(),
        userId: string(),
      }),
    )
    .query(async (opts) => {
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
            eq(timeslot.tenantId, opts.input.userId),
            opts.input.mode === "exact"
              ? eq(timeslot.date, opts.input.date)
              : between(
                  timeslot.date,
                  startOfMonth(opts.input.date),
                  endOfMonth(opts.input.date),
                ),
          ),
        );

      return slots;
    }),
  updateTimeslot: procedure
    .input(updateTimeslotSchema)
    .mutation(async (opts) => {
      const currency = opts.input.currency
        ? currencies[opts.input.currency as CurrencyCode]
        : currencies.USD;
      const normalizedAmount =
        opts.input.chargeRate * currency.base ** currency.exponent;

      await db
        .update(timeslot)
        .set({
          currency: currency.code,
          duration: String(opts.input.duration),
          chargeRate: normalizedAmount,
        })
        .where(eq(timeslot.id, opts.input.id));
    }),
});

export type Router = typeof router;
