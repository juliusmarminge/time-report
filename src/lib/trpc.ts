import { cache } from "react";
import { experimental_createServerActionHandler } from "@trpc/next/app-dir/server";
import { initTRPC } from "@trpc/server";

import { currentUser } from "./auth";

const createContext = cache(async () => {
  const user = await currentUser();
  return { user };
});

const t = initTRPC.context<typeof createContext>().create();

export const protectedProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.user) {
    throw new Error("Unauthorized");
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  });
});

export const createAction = experimental_createServerActionHandler(t, {
  createContext,
});
