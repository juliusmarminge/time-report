"use server";

import { Temporal } from "@js-temporal/polyfill";
import { revalidateTag } from "next/cache";
import { UTApi } from "uploadthing/server";
import * as z from "zod";

import { e, edgedb } from "~/edgedb";
import { CACHE_TAGS } from "~/lib/cache";
import { toDate } from "~/lib/temporal";
import type { CurrencyCode } from "~/monetary/math";
import { normalizeAmount } from "~/monetary/math";
import { protectedProcedure } from "~/trpc/init";
import { createClientSchema, updateClientSchema } from "./_validators";

export const createClient = protectedProcedure
  .input(createClientSchema)
  .mutation(async ({ ctx, input }) => {
    const currencyCode = input.currency as CurrencyCode;
    const normalized = normalizeAmount(input.defaultCharge, currencyCode);

    const now = Temporal.Now.plainDateISO();
    const currentUser = e.select(e.User, (user) => ({
      filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
    }));

    await e
      .insert(e.Period, {
        appId: 0,
        tenant: currentUser,
        startDate: toDate(
          input.defaultBillingPeriod === "monthly"
            ? now.with({ day: 1 })
            : now.with({ day: now.day - now.dayOfWeek }),
        ),
        endDate: toDate(
          input.defaultBillingPeriod === "monthly"
            ? now.with({ day: now.daysInMonth })
            : input.defaultBillingPeriod === "biweekly"
              ? now.add({ days: 13 - now.dayOfWeek })
              : now.add({ days: 6 - now.dayOfWeek }),
        ),
        client: e.insert(e.Client, {
          appId: 0,
          name: input.name,
          currency: currencyCode as any,
          defaultCharge: normalized,
          defaultBillingPeriod: input.defaultBillingPeriod,
          image: input.image,
          tenant: currentUser,
        }),
      })
      .run(edgedb);

    revalidateTag(CACHE_TAGS.CLIENTS);
    revalidateTag(CACHE_TAGS.PERIODS);
  });

export const updateClient = protectedProcedure
  .input(updateClientSchema)
  .mutation(async ({ ctx, input }) => {
    const existing = await e
      .select(e.Client, (client) => ({
        filter_single: e.op(
          e.op(client.tenantId, "=", e.uuid(ctx.user.id)),
          "and",
          e.op(client.appId, "=", input.id),
        ),
      }))
      .run(edgedb);
    if (!existing) throw new Error("Unauthorized");

    const currencyCode = input.currency as CurrencyCode;
    const normalized = normalizeAmount(input.defaultCharge, currencyCode);

    await e
      .update(e.Client, (client) => ({
        set: {
          name: input.name,
          currency: currencyCode as any,
          defaultCharge: normalized,
          defaultBillingPeriod: input.defaultBillingPeriod,
        },
        filter_single: e.op(client.appId, "=", input.id),
      }))
      .run(edgedb);

    revalidateTag(CACHE_TAGS.CLIENTS);
  });

const deleteImageIfExists = async (image?: string | null) => {
  const imageKey = image?.split("/f/")[1];
  if (imageKey) {
    await new UTApi().deleteFiles([imageKey]);
  }
};

export const deleteImageFromUT = protectedProcedure
  .input(z.string().optional())
  .mutation(async ({ input }) => {
    await deleteImageIfExists(input);
  });

export const deleteClient = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const existing = await e
      .select(e.Client, (client) => ({
        id: true,
        image: true,
        filter_single: e.op(
          e.op(client.tenantId, "=", e.uuid(ctx.user.id)),
          "and",
          e.op(client.appId, "=", input.id),
        ),
      }))
      .run(edgedb);
    if (!existing) throw new Error("Unauthorized");

    await Promise.all([
      e
        .delete(e.Client, (client) => ({
          filter_single: e.op(client.appId, "=", input.id),
        }))
        .run(edgedb),
      deleteImageIfExists(existing.image),
    ]);

    revalidateTag(CACHE_TAGS.CLIENTS);
  });
