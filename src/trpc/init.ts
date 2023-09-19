import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { auth } from "~/lib/auth";

export async function createContext() {
  const sesh = await auth();
  return {
    session: sesh,
    userId: sesh?.user?.id,
  };
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const { router: createRouter, procedure } = t;
