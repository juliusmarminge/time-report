"use server";

import { Temporal } from "@js-temporal/polyfill";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import * as z from "zod";

import { db } from "~/db/client";
import { client, period, timeslot } from "~/db/schema";
import { CACHE_TAGS } from "~/lib/cache";
import type { CurrencyCode } from "~/monetary/math";
import { normalizeAmount } from "~/monetary/math";
import { protectedProcedure } from "~/trpc/init";
import {
  closePeriodSchema,
  reportTimeSchema,
  updateSchema,
} from "./_validators";

export const reportTime = protectedProcedure
  .input(reportTimeSchema)
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
  });

export const deleteTimeslot = protectedProcedure
  .input(z.number())
  .mutation(async ({ ctx, input }) => {
    const existing = await db.query.timeslot.findFirst({
      where: and(eq(timeslot.tenantId, ctx.user.id), eq(timeslot.id, input)),
    });
    if (!existing) throw new Error("Unauthorized");

    await db.delete(timeslot).where(eq(timeslot.id, input));

    revalidateTag(CACHE_TAGS.TIMESLOTS);
    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });

export const updateTimeslot = protectedProcedure
  .input(updateSchema)
  .mutation(async ({ ctx, input }) => {
    const existing = await db.query.timeslot.findFirst({
      where: and(eq(timeslot.tenantId, ctx.user.id), eq(timeslot.id, input.id)),
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
  });

export const closePeriod = protectedProcedure
  .input(closePeriodSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const p = await db.query.period.findFirst({
      where: and(
        eq(period.id, input.id),
        eq(period.tenantId, userId),
        eq(period.status, "open"),
      ),
      with: {
        client: true,
        timeslot: true,
      },
    });
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
  });
