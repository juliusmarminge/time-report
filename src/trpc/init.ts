import { tracing } from "@baselime/node-opentelemetry/trpc";
import { TRPCError, initTRPC } from "@trpc/server";
import { experimental_nextAppDirCaller } from "@trpc/server/adapters/next-app-dir";
import { cache } from "react";
import { currentUser } from "~/auth";
import { tson } from "~/lib/tson";

export const createTRPCContext = cache(async () => {
  const user = await currentUser();
  return { user };
});

type Meta = { span: string };

const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<Meta>()
  .create({ transformer: tson });

export const { router, createCallerFactory } = t;

/**
 * Temporary little type hack to cast a trpc action
 * when passing the action to `useActionState`
 * @example useActionState(createBoard as MakeAction<typeof createBoard>)
 */
export type MakeAction<T> = T extends (...args: any[]) => Promise<infer U>
  ? (state: any, fd: FormData) => Promise<U>
  : never;

const ensureUserIsAuthed = t.middleware((opts) => {
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

const baseProcedure = t.procedure.use(
  tracing({ collectInput: true, collectResult: true }),
);
const baseAction = t.procedure
  .use(tracing({ collectInput: true, collectResult: true }))
  .experimental_caller(
    experimental_nextAppDirCaller({
      createContext: createTRPCContext,
      pathExtractor: (opts: { meta: Meta }) => opts.meta.span,
    }),
  );

export const protectedAction = baseAction.use(ensureUserIsAuthed);
export const protectedProcedure = baseProcedure.use(ensureUserIsAuthed);
