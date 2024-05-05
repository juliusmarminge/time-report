"use server";

import { Temporal } from "@js-temporal/polyfill";
import { revalidateTag } from "next/cache";
import { UTApi } from "uploadthing/server";
import * as z from "zod";

import { e, db, plainDate } from "~/edgedb";
import { CACHE_TAGS } from "~/lib/cache";
import { normalizeAmount } from "~/monetary/math";
import { protectedProcedure } from "~/trpc/init";
import { createClientSchema, updateClientSchema } from "./_validators";

export const createClient = protectedProcedure
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

    revalidateTag(CACHE_TAGS.CLIENTS);
    revalidateTag(CACHE_TAGS.PERIODS);
  });

export const updateClient = protectedProcedure
  .input(updateClientSchema)
  .mutation(async ({ ctx, input }) => {
    await e
      .update(e.Client, (client) => ({
        set: {
          ...input,
          defaultCharge: normalizeAmount(input.defaultCharge, input.currency),
        },
        filter_single: e.op(
          e.op(client.id, "=", e.uuid(input.id)),
          "and",
          e.op(client.tenantId, "=", e.uuid(ctx.user.id)),
        ),
      }))
      .run(db);

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
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const existing = await e
      .select(e.Client, (client) => ({
        id: true,
        image: true,
        filter_single: e.op(
          e.op(client.id, "=", e.uuid(input.id)),
          "and",
          e.op(client.tenantId, "=", e.uuid(ctx.user.id)),
        ),
      }))
      .run(db);
    if (!existing) throw new Error("Unauthorized");

    await Promise.all([
      db.execute("delete Client filter .id = <uuid>$id", { id: input.id }),
      deleteImageIfExists(existing.image),
    ]);

    revalidateTag(CACHE_TAGS.CLIENTS);
  });
