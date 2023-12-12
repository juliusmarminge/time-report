import { connect } from "@planetscale/database";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { credentials } from "./config";
import * as schema from "./schema";

class MyLogger implements Logger {
  constructor(private enabled = false) {}

  logQuery(query: string, params: unknown[]): void {
    this.enabled && console.log("[DRIZZLE]", { query, params });
  }
}

const ps = connect(credentials);
// If using PlanetScale Boost:
// (async () => {
//   if (process.env.PS_PROXY) return;
//   await ps.execute("SET @@boost_cached_queries = true");
// })();

export const db = drizzle(ps, {
  schema,
  logger: new MyLogger(false),
});
