import {
  experimental_createActionHook,
  experimental_serverActionLink,
} from "@trpc/next/app-dir/client";
import superjson from "superjson";

export const useAction = experimental_createActionHook({
  links: [experimental_serverActionLink()],
  transformer: superjson,
});
