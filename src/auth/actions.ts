"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { db, e } from "~/edgedb";
import { currencySchema } from "~/monetary/math";
import { protectedProcedure } from "~/trpc/init";

export const setDefaultCurrency = protectedProcedure
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

export const updateDisplayName = protectedProcedure
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

export const updateUserImage = protectedProcedure
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
