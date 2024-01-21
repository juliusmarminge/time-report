"use server";

import { revalidateTag } from "next/cache";
import { Temporal } from "@js-temporal/polyfill";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import * as v from "valibot";

import { db } from "~/db/client";
import { client, period, timeslot } from "~/db/schema";
import { CACHE_TAGS } from "~/lib/cache";
import type { CurrencyCode } from "~/lib/monetary";
import { normalizeAmount } from "~/lib/monetary";
import { createAction, protectedProcedure } from "~/lib/trpc";
import { createClientSchema, updateClientSchema } from "./_validators";

export const createClient = createAction(
  protectedProcedure
    .input((raw) => v.parse(createClientSchema, raw))
    .mutation(async ({ ctx, input }) => {
      const currencyCode = input.currency as CurrencyCode;
      const normalized = normalizeAmount(input.defaultCharge, currencyCode);

      const newClient = await db.insert(client).values({
        name: input.name,
        currency: currencyCode,
        defaultCharge: normalized,
        defaultBillingPeriod: input.defaultBillingPeriod,
        image: input.image,
        tenantId: ctx.user.id,
      });

      const now = Temporal.Now.plainDateISO();

      await db.insert(period).values({
        clientId: parseInt(newClient.insertId),
        startDate:
          input.defaultBillingPeriod === "monthly"
            ? now.with({ day: 1 })
            : now.with({ day: now.day - now.dayOfWeek }),
        endDate:
          input.defaultBillingPeriod === "monthly"
            ? now.with({ day: now.daysInMonth })
            : input.defaultBillingPeriod === "biweekly"
              ? now.add({ days: 13 - now.dayOfWeek })
              : now.add({ days: 6 - now.dayOfWeek }),
        tenantId: ctx.user.id,
      });

      revalidateTag(CACHE_TAGS.CLIENTS);
      revalidateTag(CACHE_TAGS.PERIODS);
    }),
);

export const updateClient = createAction(
  protectedProcedure
    .input((raw) => v.parse(updateClientSchema, raw))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.client.findFirst({
        columns: { id: true },
        where: and(eq(client.tenantId, ctx.user.id), eq(client.id, input.id)),
      });
      if (!existing) throw new Error("Unauthorized");

      const currencyCode = input.currency as CurrencyCode;
      const normalized = normalizeAmount(input.defaultCharge, currencyCode);

      await db
        .update(client)
        .set({
          name: input.name,
          currency: currencyCode,
          defaultCharge: normalized,
          defaultBillingPeriod: input.defaultBillingPeriod,
        })
        .where(eq(client.id, input.id));

      revalidateTag(CACHE_TAGS.CLIENTS);
    }),
);

const deleteImageIfExists = async (image?: string | null) => {
  const imageKey = image?.split("/f/")[1];
  if (imageKey) {
    await new UTApi().deleteFiles([imageKey]);
  }
};

export const deleteImageFromUT = createAction(
  protectedProcedure
    .input((raw) => v.parse(v.optional(v.string()), raw))
    .mutation(async ({ input }) => {
      await deleteImageIfExists(input);
    }),
);

export const deleteClient = createAction(
  protectedProcedure
    .input((raw) => v.parse(v.object({ id: v.number() }), raw))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.client.findFirst({
        columns: { id: true, image: true },
        where: and(eq(client.tenantId, ctx.user.id), eq(client.id, input.id)),
      });
      if (!existing) throw new Error("Unauthorized");

      await Promise.all([
        db.delete(client).where(eq(client.id, input.id)),
        db.delete(period).where(eq(period.clientId, input.id)),
        db.delete(timeslot).where(eq(timeslot.clientId, input.id)),
        deleteImageIfExists(existing.image),
      ]);

      revalidateTag(CACHE_TAGS.CLIENTS);
    }),
);
