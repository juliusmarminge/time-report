import { tracing } from "@baselime/node-opentelemetry/trpc";
import { TRPCError, initTRPC } from "@trpc/server";
import type { Session } from "next-auth";

export const t = initTRPC.context<{ user: Session["user"] | null }>().create();

const baselime = tracing({ collectInput: true, collectResult: true });

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
