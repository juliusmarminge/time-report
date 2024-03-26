import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { credentials } from "./config";
import * as schema from "./schema";

const ps = new Client(credentials);
// If using PlanetScale Boost:
// (async () => {
//   if (process.env.PS_PROXY) return;
//   await ps.execute("SET @@boost_cached_queries = true");
// })();

export const db = drizzle(ps, {
  schema,
  logger: {
    logQuery(_query: string, _params: unknown[]): void {
      // console.log("[DRIZZLE]", { query: _query, params: _params });
    },
  },
});
