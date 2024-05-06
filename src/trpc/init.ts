import { tracing } from "@baselime/node-opentelemetry/trpc";
import { TRPCError, initTRPC } from "@trpc/server";
import { currentUser } from "~/auth";

type Meta = { span: string };
export const t = initTRPC.meta<Meta>().create();

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
  .experimental_caller(async (opts) => {
    const path = (opts._def.meta as Meta | undefined)?.span ?? "";
    switch (opts._def.type) {
      case "mutation": {
        /**
         * When you wrap an action with useFormState, it gets an extra argument as its first argument.
         * The submitted form data is therefore its second argument instead of its first as it would usually be.
         * The new first argument that gets added is the current state of the form.
         * @see https://react.dev/reference/react-dom/hooks/useFormState#my-action-can-no-longer-read-the-submitted-form-data
         */
        const input = opts.args.length === 1 ? opts.args[0] : opts.args[1];

        return opts.invoke({
          type: "mutation",
          ctx: {},
          getRawInput: async () => input,
          path,
          input,
        });
      }
      case "query": {
        const input = opts.args[0];
        return opts.invoke({
          type: "query",
          ctx: {},
          getRawInput: async () => input,
          path,
          input,
        });
      }
      default: {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: `Not implemented for type ${opts._def.type}`,
        });
      }
    }
  });

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
