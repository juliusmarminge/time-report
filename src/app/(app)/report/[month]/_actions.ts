"use server";

import { revalidateTag } from "next/cache";
import * as z from "zod";

import { db, e } from "~/edgedb";
import { CACHE_TAGS } from "~/lib/cache";
import { normalizeAmount } from "~/monetary/math";
import { protectedProcedure } from "~/trpc/init";
import {
  closePeriodSchema,
  reportTimeSchema,
  updateSchema,
} from "./_validators";

export const reportTime = protectedProcedure
  .meta({ span: "reportTime" })
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

    revalidateTag(CACHE_TAGS.TIMESLOTS);
    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });

export const deleteTimeslot = protectedProcedure
  .meta({ span: "deleteTimeslot" })
  .input(z.string())
  .mutation(async ({ ctx, input }) => {
    await db.execute(
      "delete Timeslot filter .id = <uuid>$id and .tenant.id = <uuid>$tenantId",
      { id: input, tenantId: ctx.user.id },
    );

    revalidateTag(CACHE_TAGS.TIMESLOTS);
    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });

export const updateTimeslot = protectedProcedure
  .meta({ span: "updateTimeslot" })
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

    revalidateTag(CACHE_TAGS.TIMESLOTS);
    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });
