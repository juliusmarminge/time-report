import "server-only";

import { QueryClient } from "@tanstack/react-query";
import { experimental_createServerActionHandler } from "@trpc/next/app-dir/server";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";

import { currentUser } from "~/auth/rsc";
import { t } from "./init";
import { type AppRouter, appRouter } from "./router";

const createContext = cache(async () => {
  const user = await currentUser();
  return { user };
});

const procedureCaller = t.createCallerFactory(appRouter)(createContext);
const getQueryClient = cache(() => new QueryClient());

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  procedureCaller,
  getQueryClient,
);

export const createAction = experimental_createServerActionHandler(t, {
  createContext,
});
