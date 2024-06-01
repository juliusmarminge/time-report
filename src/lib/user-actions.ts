"use server";

import { revalidateTag } from "next/cache";

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
