import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createContext } from "~/trpc/init";
import { router } from "~/trpc/router";

export const runtime = "edge";

const handlers = (req: Request) =>
  fetchRequestHandler({
    req,
    router,
    createContext,
    endpoint: "/api/trpc",
  });

export { handlers as GET, handlers as POST };
