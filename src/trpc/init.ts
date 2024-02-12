import { trpcTracingMiddleware } from "@baselime/node-opentelemetry";
import { TRPCError, initTRPC } from "@trpc/server";
import type { Session } from "next-auth";

import { tson } from "~/lib/tson";

export const t = initTRPC.context<{ user: Session["user"] | null }>().create({
  transformer: tson,
});

const baselime = trpcTracingMiddleware({ collectInput: true });

export const protectedProcedure = t.procedure.use(baselime).use((opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  });
});
