import { tracing } from "@baselime/node-opentelemetry/trpc";
import { TRPCError, initTRPC } from "@trpc/server";
import { experimental_nextAppDirCaller } from "@trpc/server/adapters/next-app-dir";
import { currentUser } from "~/auth";

type Meta = { span: string };
export const t = initTRPC.meta<Meta>().create();

/**
 * Temporary little type hack to cast a trpc action
 * when passing the action to `useActionState`
 * @example useActionState(createBoard as MakeAction<typeof createBoard>)
 */
export type MakeAction<T> = T extends (...args: any[]) => Promise<infer U>
  ? (state: any, fd: FormData) => Promise<U>
  : never;

const base = t.procedure
  .use(async (opts) => {
    // Inject user into context
    const user = await currentUser();
    return opts.next({ ctx: { user } });
  })
  .use(
    // Add tracing to all procedures
    tracing({ collectInput: true, collectResult: true }),
  )
  .experimental_caller(
    experimental_nextAppDirCaller({
      pathExtractor: (opts: { meta: Meta }) => opts.meta.span,
    }),
  );

export const protectedProcedure = base.use((opts) => {
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
