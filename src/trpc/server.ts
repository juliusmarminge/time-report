import { experimental_nextHttpLink } from "@trpc/next/app-dir/links/nextHttp";
import { experimental_createTRPCNextAppDirServer } from "@trpc/next/app-dir/server";
import superjson from "superjson";

import type { Router } from "./router";

export const trpc = experimental_createTRPCNextAppDirServer<Router>({
  config() {
    return {
      links: [
        experimental_nextHttpLink({
          batch: true,
          unstable_stream: true,
          url: "http://localhost:3000/api/trpc",
        }),
      ],
      transformer: superjson,
    };
  },
});
