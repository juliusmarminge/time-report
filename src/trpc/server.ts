import "server-only";

import { cache } from "react";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createCallerFactory } from "~/trpc/init";
import { makeQueryClient } from "~/lib/query-client";
import { createTRPCContext } from "~/trpc/init";
import { appRouter } from "~/trpc/router";

/**
 * Create a stable getter for the query client that
 * will return the same client during the same request.
 */
const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);
