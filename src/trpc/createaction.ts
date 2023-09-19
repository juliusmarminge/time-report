import { experimental_createServerActionHandler } from "@trpc/next/app-dir/server";

import { createContext } from "./init";
import { router } from "./router";

export const createAction = experimental_createServerActionHandler({
  router,
  createContext,
});
