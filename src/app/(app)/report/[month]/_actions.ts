"use server";

import { Temporal } from "@js-temporal/polyfill";
import { revalidateTag } from "next/cache";
import * as z from "zod";

import { e, edgedb } from "~/edgedb";
import { CACHE_TAGS } from "~/lib/cache";
import type { CurrencyCode } from "~/monetary/math";
import { normalizeAmount } from "~/monetary/math";
import { protectedProcedure } from "~/trpc/init";
import {
  closePeriodSchema,
  reportTimeSchema,
  updateSchema,
} from "./_validators";
import { toDate } from "~/lib/temporal";

export const reportTime = protectedProcedure
  .input(reportTimeSchema)
  .mutation(async ({ ctx, input }) => {
    const existingClient = await e
      .select(e.Client, (client) => ({
        filter: e.op(
          e.op(client.tenantId, "=", e.uuid(ctx.user.id)),
          "and",
          e.op(client.appId, "=", input.clientId),
        ),
      }))
      .run(edgedb);
    if (!existingClient) throw new Error("Unauthorized");

    const currencyCode = input.currency as CurrencyCode;
    const normalized = normalizeAmount(input.chargeRate, currencyCode);

    const slotPeriod = await e
      .select(e.Period, (period) => ({
        filter_single: e.all(
          e.set(
            e.op(period.status, "=", "open"),
            e.op(period.tenantId, "=", e.uuid(ctx.user.id)),
            e.op(period.appId, "=", input.clientId),
          ),
        ),
      }))
      .run(edgedb);
    if (!slotPeriod) {
      // TODO: Create a new one
      throw new Error("No open period found");
    }

    console.log("Inserting timeslot for period", slotPeriod.id);

    await e
      .insert(e.Timeslot, {
        appId: 0,
        date: toDate(Temporal.PlainDate.from(input.date)),
        duration: String(input.duration),
        chargeRate: normalized,
        currency: currencyCode as any,
        description: input.description,
        client: e.select(e.Client, (client) => ({
          filter_single: e.op(client.appId, "=", input.clientId),
        })),
        period: e.select(e.Period, (period) => ({
          filter_single: e.op(period.appId, "=", input.clientId),
        })),
        tenant: e.select(e.User, (user) => ({
          filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
        })),
      })
      .run(edgedb);

    revalidateTag(CACHE_TAGS.TIMESLOTS);
    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });

export const deleteTimeslot = protectedProcedure
  .input(z.number())
  .mutation(async ({ ctx, input }) => {
    await e
      .delete(e.Timeslot, () => ({
        filter_single: e.op(
          e.op(e.Timeslot.tenantId, "=", e.uuid(ctx.user.id)),
          "and",
          e.op(e.Timeslot.appId, "=", input),
        ),
      }))
      .run(edgedb);

    revalidateTag(CACHE_TAGS.TIMESLOTS);
    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });

export const updateTimeslot = protectedProcedure
  .input(updateSchema)
  .mutation(async ({ ctx, input }) => {
    const currencyCode = input.currency as CurrencyCode;
    const normalized = normalizeAmount(input.chargeRate, currencyCode);

    await e
      .update(e.Timeslot, (timeslot) => ({
        set: {
          currency: currencyCode as any,
          duration: String(input.duration),
          chargeRate: normalized,
        },
        filter_single: e.op(
          e.op(timeslot.tenantId, "=", e.uuid(ctx.user.id)),
          "and",
          e.op(timeslot.appId, "=", input.id),
        ),
      }))
      .run(edgedb);

    revalidateTag(CACHE_TAGS.TIMESLOTS);
    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });

export const closePeriod = protectedProcedure
  .input(closePeriodSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    const existing = await e
      .select(e.Period, (period) => ({
        filter_single: e.all(
          e.set(
            e.op(period.status, "=", "open"),
            e.op(period.tenantId, "=", e.uuid(userId)),
            e.op(period.appId, "=", input.id),
          ),
        ),
      }))
      .run(edgedb);
    if (!existing) throw new Error("Unauthorized");

    await e
      .update(e.Period, (period) => ({
        set: { status: e.PeriodStatus.closed, closedAt: new Date() },
        filter_single: e.op(period.id, "=", e.uuid(existing.id)),
      }))
      .run(edgedb);

    if (input.openNewPeriod) {
      await e
        .insert(e.Period, {
          appId: 0,
          status: e.PeriodStatus.open,
          tenant: e.select(e.User, (user) => ({
            filter_single: e.op(user.id, "=", e.uuid(userId)),
          })),
          client: e.select(e.Client, (client) => ({
            filter_single: e.op(client.appId, "=", input.clientId),
          })),
          startDate: toDate(Temporal.PlainDate.from(input.periodStart)),
          endDate: toDate(Temporal.PlainDate.from(input.periodEnd)),
        })
        .run(edgedb);
    }

    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });
