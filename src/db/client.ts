import { Client } from "@planetscale/database";
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

export const db = drizzle(new Client(credentials).connection(), {
  schema,
  logger: new MyLogger(false),
});
