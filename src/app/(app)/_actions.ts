"use server";

import { protectedAction } from "~/trpc/init";
import { closePeriodSchema } from "./report/[month]/_validators";
import { db, e } from "~/edgedb";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "~/lib/cache";
import { currencySchema } from "~/monetary/math";
import { z } from "zod";

export const setDefaultCurrency = protectedAction
  .meta({ span: "setDefaultCurrency" })
  .input(currencySchema)
  .mutation(async ({ ctx, input }) => {
    await e
      .update(e.User, (user) => ({
        set: { defaultCurrency: input },
        filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
      }))
      .run(db);

    revalidateTag("/");

    return { ok: true };
  });

export const updateDisplayName = protectedAction
  .meta({ span: "updateDisplayName" })
  .input(z.string().min(1, "Name must be at least 1 character long"))
  .mutation(async ({ ctx, input }) => {
    await e
      .update(e.User, (user) => ({
        set: { name: input },
        filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
      }))
      .run(db);

    revalidatePath("/", "layout");

    return { ok: true };
  });

export const updateUserImage = protectedAction
  .meta({ span: "updateUserImage" })
  .input(z.string().url())
  .mutation(async ({ ctx, input }) => {
    await e
      .update(e.User, (user) => ({
        set: { image: input },
        filter_single: e.op(user.id, "=", e.uuid(ctx.user.id)),
      }))
      .run(db);

    return { ok: true };
  });

export const closePeriod = protectedAction
  .meta({ span: "closePeriod" })
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

    revalidateTag(CACHE_TAGS.PERIODS);
    revalidateTag(CACHE_TAGS.CLIENTS);
  });
