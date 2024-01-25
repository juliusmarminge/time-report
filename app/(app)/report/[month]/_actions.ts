"use server";

import { Temporal } from "@js-temporal/polyfill";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import * as v from "valibot";

import { db } from "~/db/client";
import { getOpenPeriods } from "~/db/queries";
import { client, period, timeslot } from "~/db/schema";
import { CACHE_TAGS } from "~/lib/cache";
import type { CurrencyCode } from "~/lib/monetary";
import { normalizeAmount } from "~/lib/monetary";
import { createAction, protectedProcedure } from "~/lib/trpc";
import {
  closePeriodSchema,
  reportTimeSchema,
  updateSchema,
} from "./_validators";

export const reportTime = createAction(
  protectedProcedure
    .input((raw) => v.parse(reportTimeSchema, raw))
    .mutation(async ({ ctx, input }) => {
      const existingClient = await db.query.client.findFirst({
        where: and(
          eq(client.tenantId, ctx.user.id),
          eq(client.id, input.clientId),
        ),
      });
      if (!existingClient) throw new Error("Unauthorized");

      const currencyCode = input.currency as CurrencyCode;
      const normalized = normalizeAmount(input.chargeRate, currencyCode);

      const slotPeriod = await db.query.period.findFirst({
        where: and(
          eq(period.status, "open"),
          eq(period.tenantId, ctx.user.id),
          eq(period.clientId, input.clientId),
        ),
      });
      if (!slotPeriod) {
        // TODO: Create a new one
        throw new Error("No open period found");
      }

      console.log("Inserting timeslot for period", slotPeriod.id);

      await db.insert(timeslot).values({
        date: Temporal.PlainDate.from(input.date),
        duration: String(input.duration),
        chargeRate: normalized,
        currency: currencyCode,
        description: input.description,
        clientId: input.clientId,
        tenantId: ctx.user.id,
        periodId: slotPeriod.id,
      });

      revalidateTag(CACHE_TAGS.TIMESLOTS);
      revalidateTag(CACHE_TAGS.PERIODS);
      revalidateTag(CACHE_TAGS.CLIENTS);
    }),
);

export const deleteTimeslot = createAction(
  protectedProcedure
    .input((raw) => v.parse(v.number(), raw))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.timeslot.findFirst({
        where: and(eq(timeslot.tenantId, ctx.user.id), eq(timeslot.id, input)),
      });
      if (!existing) throw new Error("Unauthorized");

      await db.delete(timeslot).where(eq(timeslot.id, input));

      revalidateTag(CACHE_TAGS.TIMESLOTS);
      revalidateTag(CACHE_TAGS.PERIODS);
      revalidateTag(CACHE_TAGS.CLIENTS);
    }),
);

export const updateTimeslot = createAction(
  protectedProcedure
    .input((raw) => v.parse(updateSchema, raw))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.timeslot.findFirst({
        where: and(
          eq(timeslot.tenantId, ctx.user.id),
          eq(timeslot.id, input.id),
        ),
      });
      if (!existing) throw new Error("Unauthorized");

      const currencyCode = input.currency as CurrencyCode;
      const normalized = normalizeAmount(input.chargeRate, currencyCode);

      await db
        .update(timeslot)
        .set({
          currency: currencyCode,
          duration: String(input.duration),
          chargeRate: normalized,
        })
        .where(eq(timeslot.id, input.id));

      revalidateTag(CACHE_TAGS.TIMESLOTS);
      revalidateTag(CACHE_TAGS.PERIODS);
      revalidateTag(CACHE_TAGS.CLIENTS);
    }),
);

export const closePeriod = createAction(
  protectedProcedure
    .input((raw) => v.parse(closePeriodSchema, raw))
    .mutation(async ({ ctx, input }) => {
      const openPeriods = await getOpenPeriods(ctx.user.id);
      const p = openPeriods.find((p) => p.id === input.id);
      if (!p) throw new Error("Unauthorized");

      await db
        .update(period)
        .set({ status: "closed", closedAt: new Date() })
        .where(eq(period.id, input.id));

      if (input.openNewPeriod) {
        await db.insert(period).values({
          status: "open",
          tenantId: ctx.user.id,
          clientId: input.clientId,
          startDate: Temporal.PlainDate.from(input.periodStart),
          endDate: Temporal.PlainDate.from(input.periodEnd),
        });
      }

      revalidateTag(CACHE_TAGS.PERIODS);
      revalidateTag(CACHE_TAGS.CLIENTS);
    }),
);
